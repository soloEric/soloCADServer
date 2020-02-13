const CATTER = require('./tools/catter');
const TIMESTAMP = require('./tools/timeStamp');
const LOGGER = require('./tools/logger');
const FLDMNGR = require('./Managers/folderManager');
const DWGIMP = require('./tools/dwgImport');
const PDFMNGR = require('./Managers/pdfManager')
const INTERCON = require('./tools/interconnection');

const HOST_NAME = '192.168.1.18';
const PORT = '8080';



// const companiesJSON = require('./equipment_data/companies.json');
// const MODULES_JSON = require('./equipment_data/modules.json');
// const INVERTERS_JSON = require('./equipment_data/inverters.json');
// const RAILINGS_JSON = require('./equipment_data/railings.json');
// const ATTACHMENTS_JSON = require('./equipment_data/attachments.json')

// const SPAWN = require('child_process').spawn;
const AdmZip = require('adm-zip');

const FS = require('fs');
// const url = require('url');
const PATH = require('path');

const PYTHON_SCRIPTS = {
    //add key/val pair of python script name and the  relative path to the script
    'combinePy': './pythonScripts/spec_sheet_compiler_SERVER.py',
    'dwg_import': './pythonScripts/dwg_import_SERVER.py'
}

const MIME_TYPE = {
    '.dwg': 'application/acad',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.zip': 'application/octet-stream'
}

const EXPRESS = require('express');
const QUEUE = require('express-queue');
const APP = EXPRESS();
const BODY_PARSER = require('body-parser');

APP.use(QUEUE({ activeLimit: 2, queuedLimit: -1 }));
const JSON_PARSER = BODY_PARSER.json();

const RAW_PARSER = function (req, res, next) {
    req.rawBody = [];
    req.on('data', function (chunk) {
        req.rawBody.push(chunk);
        // console.log(chunk)
    });
    req.on('end', function () {
        req.rawBody = Buffer.concat(req.rawBody);
        next();
    });
}

APP.route('/InterconCalc').post(JSON_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /InterconCalc`);
	let conlist = INTERCON.calculate(req.body);
	if (conlist.length > 0) {
		res.status(201);
		res.send(conlist);
	} else {
		res.status(500);
		res.send("Server Error 501");
	}
});

// Client sends JSON file with parameter values for dwg import
// Server creates local folder for Python to create dwg dump
// Server zips up dwg dump and sends it to Client
// Server Cleans up local files
APP.route('/dwgImport').post(JSON_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /dwgImport`);

    //create local folder
    let funcFolderName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}.dwgImport`;
    FLDMNGR.createLocalFolder(funcFolderName);

    DWGIMP.moveDwgs(req.body, funcFolderName);
    if (FS.existsSync(funcFolderName)) {
        let files = FS.readdirSync(funcFolderName);
        if (!files.length) {
            res.status(500);
            res.send("Server Error 101");
        } else {
            let zip = new AdmZip();
            for (const file of files) {
                LOGGER.log(PATH.join(`./${funcFolderName}`, file));
                zip.addLocalFile(PATH.join(`./${funcFolderName}`, file));
            }
            res.status(201);
            res.set('Accept', MIME_TYPE['.zip']);
            res.send(zip.toBuffer());
            LOGGER.log("Successfully Sent XREF Zip");
        }
    }
    //clean up
    FLDMNGR.removeLocalFolder(funcFolderName);
});

APP.route('/pdfCombine').post(RAW_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombine`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}_pdfCombine.zip`
    req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                res.status(500);
                res.send("Server Error 201");
                FLDMNGR.removeLocalFile(serverZipFileName);
            } else {
                LOGGER.log(`Writing to file: ${serverZipFileName}`);

                //unzip file
                let newDir = __dirname + "/" + serverZipFileName.substring(0, serverZipFileName.length - 4);
                try {
                    let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);

                    if (!FS.existsSync(newDir)) {
                        FS.mkdirSync(newDir);
                        zip.extractAllTo(newDir);
                        FS.unlinkSync(__dirname + "/" + serverZipFileName);
                    }
                } catch (error) {
                    res.status(500);
                    res.send("Server Error 202");
                    FLDMNGR.removeLocalFile(serverZipFileName);
                }
                const files = FS.readdirSync(newDir);
                let pdfName;
                for (const file of files) {
                    LOGGER.log(`Loading Parameter: ${file}`);
                    if (file.substring(file.length - 4) === ".pdf") {
                        pdfName = newDir + '/' + file;
                    }
                }
                const json = JSON.parse(FS.readFileSync(newDir + "/specList.json"));
                let bytes;
                try {
                    bytes = PDFMNGR.compileLocal(pdfName, json);
                    FS.writeFileSync(newDir + '/sendThis.pdf', bytes);
                } catch (errMsg) {
                    LOGGER.log(errMsg);
                } if (bytes) {
                    res.status(201);
                    res.set('Content-Type', 'application/octet-stream');
                    res.send(FS.readFileSync(newDir + '/sendThis.pdf'));
                    FLDMNGR.removeLocalFolder(newDir);
                } else {
                    LOGGER.log('PDF Manager compile returned empty');
                    res.status(500);
                    res.send('Server Error 203');
                    FLDMNGR.removeLocalFolder(newDir);
		    FLDMNGR.removeLocalFile(serverZipFileName);
                }
            }
        });
    } catch (err) {
        LOGGER.log(err);
    }
});

APP.route('/pdfCombineClient').post(RAW_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombineClient`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}_pdfInsert.zip`
    req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                res.status(500);
                res.send("Server Error 301");
                FLDMNGR.removeLocalFile(serverZipFileName);
                return;
            } else {
                LOGGER.log(`Writing to file: ${serverZipFileName}`);

                //unzip file
                let newDir = __dirname + "/" + serverZipFileName.substring(0, serverZipFileName.length - 4);
                let newDirName = serverZipFileName.substring(0, serverZipFileName.length - 4);
                try {
                    let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);

                    if (!FS.existsSync(newDir)) {
                        FS.mkdirSync(newDir);
                        zip.extractAllTo(newDir);
                        FS.unlinkSync(__dirname + "/" + serverZipFileName);
                    }
                } catch (error) {
                    res.status(500);
                    res.send("Server Error 302");
                    FLDMNGR.removeLocalFile(serverZipFileName);
		    FLDMNGR.removeLocalFolder(newDir);
                    return;
                }

                let bytes;
                try {
                    bytes = PDFMNGR.compile(newDirName);
                    FS.writeFileSync(newDir + '/sendThis.pdf', bytes);
                } catch (errMsg) {
                    LOGGER.log(errMsg);
                } if (bytes) {
                    res.status(201);
                    res.set('Content-Type', 'application/octet-stream');
                    res.send(FS.readFileSync(newDir + '/sendThis.pdf'));
                    FLDMNGR.removeLocalFolder(newDir);
                } else {
                    LOGGER.log('PDF Manager insert returned empty');
                    res.status(500);
                    res.send('Server Error 303');
                    FLDMNGR.removeLocalFolder(newDir);
		    FLDMNGR.removeLocalFile(serverZipFileName);
                }
            }
        });
    } catch (err) {
        LOGGER.log(err);
    }
});


APP.route('/pdfInsert').post(RAW_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfInsert`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}_pdfInsert.zip`
    req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                res.status(500);
                res.send("Server Error 401");
                FLDMNGR.removeLocalFile(serverZipFileName);
                return;
            } else {
                LOGGER.log(`Writing to file: ${serverZipFileName}`);

                //unzip file
                let newDir = __dirname + "/" + serverZipFileName.substring(0, serverZipFileName.length - 4);
                let newDirName = serverZipFileName.substring(0, serverZipFileName.length - 4);
                try {
                    let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);

                    if (!FS.existsSync(newDir)) {
                        FS.mkdirSync(newDir);
                        zip.extractAllTo(newDir);
                        FS.unlinkSync(__dirname + "/" + serverZipFileName);
                    }
                } catch (error) {
                    res.status(500);
                    res.send("Server Error 402");
                    FLDMNGR.removeLocalFile(serverZipFileName);
		    FLDMNGR.removeLocalFolder(newDir);
                    return;
                }
                const files = FS.readdirSync(newDir);
                let json;
                for (const file of files) {
                    if (file.substr(file.length - 5) === ".json") {
                        json = JSON.parse(FS.readFileSync(newDir + `/${file}`));
                        break;
                    }
                }
                let toInsert, intoPdf, index;
                if (json) {
                    toInsert = json["insert"];
                    intoPdf = json["into"];
                    index = json["index"];
                } else {
                    res.status(500);
                    res.send("Server Error 403");
                    FLDMNGR.removeLocalFile(serverZipFileName);
		    FLDMNGR.removeLocalFolder(newDir);
                    return;
                }

                let bytes;
                try {
                    bytes = PDFMNGR.insert(toInsert, intoPdf, index, newDirName);
                    FS.writeFileSync(newDir + '/sendThis.pdf', bytes);
                } catch (errMsg) {
                    LOGGER.log(errMsg);
                } if (bytes) {
                    res.status(201);
                    res.set('Content-Type', 'application/octet-stream');
                    res.send(FS.readFileSync(newDir + '/sendThis.pdf'));
                    FLDMNGR.removeLocalFolder(newDir);
                } else {
                    LOGGER.log('PDF Manager insert returned empty');
                    res.status(500);
                    res.send('Server Error 404');
                    FLDMNGR.removeLocalFolder(newDir);
		    FLDMNGR.removeLocalFile(serverZipFileName);
                }
            }
        });
    } catch (err) {
        LOGGER.log(err);
    }
});

// This option is currently not needed
//  Update this route when we move to a client that doesn't need updating. 
// Client requests a list of available equipment to populate dropdowns in excel file
APP.route('/requestEquip').get(function (req, res, next) {
    console.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /requestEquip`);
    res.statusCode = 200;
    res.set('Content-Type', MIME_TYPE['.json']);


    //let jsonSTR = CATTER.jsonConcat(companiesJSON, MODULES_JSON);
    let jsonSTR = CATTER.jsonConcat(MODULES_JSON, INVERTERS_JSON);
    //jsonSTR = CATTER.jsonConcat(JSON.parse(jsonSTR), INVERTERS_JSON);
    jsonSTR = CATTER.jsonConcat(JSON.parse(jsonSTR), RAILINGS_JSON);
    jsonSTR = CATTER.jsonConcat(JSON.parse(jsonSTR), ATTACHMENTS_JSON);
    //console.log(JSON.parse(jsonSTR));
    res.send(jsonSTR);

});

//default pathway
APP.get('/', (function (req, res, next) {
    console.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to for Instructions`);
    res.send('INSTRUCTIONS FOR APP USE\n' +
        'To auto fill customer information, click Import CSV\n\n' +
        'To Download equipment specsheets, have your equipment info selected ' +
        'then click "Download SpecSheets"\n\n' +
        'To Download a pdf of your CAD with specSheets attached,\n' +
        'make sure your equipment is selected and then click Attach From Server Specs ' +
        'Then select your CAD you want pdfs attached to. Then look ' +
        'for a pdf called "Combined Cad.pdf" in your current excel directory\n' +
	'To attach specs individually, click "Attach Spec Sheets", ' +
	'Type in the number of pdfs being combined, then select each pdf ' + 
	'in the order you want them to be combined\n' +
	'To insert a pdf into another, click "Insert PDF into PDF, ' +
	'then select the pdf to insert into, then select the pdf to insert, ' +
	'followed by the page number to insert at');
}));

//all other unhandled pathway
APP.use(function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /unhandled_route\nError 404 sent to Client`);
    res.status(404);
    res.send("Error 404: Resource not found");
    next();
});

var server = APP.listen(PORT, function () {
    console.log(`server running on ${HOST_NAME}:${PORT}\n`);
});
