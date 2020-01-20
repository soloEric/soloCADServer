
const CATTER = require('./tools/catter');
const TIMESTAMP = require('./tools/timeStamp');
const LOGGER = require('./tools/logger');
const FLDMNGR = require('./tools/folderManager');
const DWGIMP = require('./tools/dwgImport');
const PDFMNGR = require('./Managers/pdfManager')

const HOST_NAME = '192.168.0.126';
const PORT = '8081';



//const companiesJSON = require('./equipment_data/companies.json');
const MODULES_JSON = require('./equipment_data/modules.json');
const INVERTERS_JSON = require('./equipment_data/inverters.json');
const RAILINGS_JSON = require('./equipment_data/railings.json');
const ATTACHMENTS_JSON = require('./equipment_data/attachments.json')

const SPAWN = require('child_process').spawn;
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
APP.use(errorHandler);
APP.use(logErrors);
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
function errorHandler(err, req, res, next) {
    res.statusCode = 500;
    res.send();
}

function logErrors(err, req, res, next) {
    console.error(TIMESTAMP.stamp(), err.stack);
    LOGGER.log(err.stack);
    next(err);
}


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
            res.status = 500;
            res.send("Server Error");
        } else {
            let zip = new AdmZip();
            for (const file of files) {
                LOGGER.log(PATH.join(`./${funcFolderName}`, file));
                zip.addLocalFile(PATH.join(`./${funcFolderName}`, file));
            }
            res.set('status', 201);
            res.set('Accept', MIME_TYPE['.zip']);
            res.send(zip.toBuffer());
            LOGGER.log("Successfully Sent XREF Zip");
        }
    }
    //clean up
    FLDMNGR.removeLocalFolder(funcFolderName);
});

// APP.route('/pdfCombine').post(RAW_PARSER, function (req, res, next) {
//     LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombine`);

//     let serverZipFileName = `${req.connection.remoteAddress.substring(req.connection.remoteAddress.length - 3)}_${Date.now().toString().substr(Date.now().toString().length - 8)}.zip`
//     console.log(serverZipFileName);
//     req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
//     try {
//         FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
//             if (err) {
//                 res.status = 500;
//                 res.send("Server Error #");
//                 FLDMNGR.removeLocalFolder(serverZipFileName);
//             } else {
//                 LOGGER.log(`Writing to file: ${serverZipFileName}`);

//                 //unzip file
//                 let newDir = __dirname + "\\" + serverZipFileName.substring(0, serverZipFileName.length - 4);
//                 try {
//                     let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);

//                     if (!FS.existsSync(newDir)) {
//                         FS.mkdirSync(newDir);
//                         zip.extractAllTo(newDir);
//                         FS.unlinkSync(__dirname + "\\" + serverZipFileName);
//                     }
//                 } catch (error) {
//                     res.status = 500;
//                     res.send("Server Error #");
//                     FLDMNGR.removeLocalFolder(serverZipFileName);
//                 }
//                 let files = FS.readdirSync(newDir);
//                 let pdfName;
//                 for (const file of files) {
//                     LOGGER.log(`Loading Parameter: ${file}`);
//                     if (file.substring(file.length - 4) === ".pdf") {
//                         pdfName = file;
//                     }
//                 }
//                 const json = FS.readFileSync(newDir + "\\specList.json");

//                 PDFMNGR.compile(FS.readFileSync(`${newDir}\\${pdfName}`), json, `${newDir}\\combined.pdf`).then(function (buffer) {
//                     res.status = 201;
//                     console.log();
//                     res.send(FS.readFileSync(`${newDir}\\combined.pdf`));
//                     FLDMNGR.removeLocalFolder(newDir);
//                 }, (err) => {
//                     LOGGER.log(err);
//                     FLDMNGR.removeLocalFolder(newDir);
//                 });
//             }
//         });
//     } catch (err) {
//         LOGGER.log(err);
//     }
// });


APP.route('/pdfCombine').post(RAW_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombine`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}_pdfCombine.zip`
    req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                res.status = 500;
                res.send("Server Error #");
                FLDMNGR.removeLocalFolder(serverZipFileName);
            } else {
                LOGGER.log(`Writing to file: ${serverZipFileName}`);

                //unzip file
                let newDir = __dirname + "\\" + serverZipFileName.substring(0, serverZipFileName.length - 4);
                try {
                    let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);

                    if (!FS.existsSync(newDir)) {
                        FS.mkdirSync(newDir);
                        zip.extractAllTo(newDir);
                        FS.unlinkSync(__dirname + "\\" + serverZipFileName);
                    }
                } catch (error) {
                    res.status = 500;
                    res.send("Server Error #");
                    FLDMNGR.removeLocalFolder(serverZipFileName);
                }
                let files = FS.readdirSync(newDir);
                let pdfName;
                for (const file of files) {
                    LOGGER.log(`Loading Parameter: ${file}`);
                    if (file.substring(file.length - 4) === ".pdf") {
                        pdfName = file;
                    }
                }
                const pyJSON = FS.readFileSync(newDir + "\\specList.json");
                //Call Python to create pdf
                const combinePy = SPAWN('python', [PYTHON_SCRIPTS['combinePy'], newDir, pdfName, pyJSON]);
                combinePy.stdout.on('data', (data) => {
                    if (data) {
                        LOGGER.log(`Python pdf combine returned with response: ${data.toString()}`);
                        //respond to client with pdf

                        if (FS.existsSync(newDir + '/Combined CAD.pdf')) {
                            //return combined pdf
                            let combinedPdf = FS.readFileSync(newDir + '/Combined CAD.pdf')
                            res.status = 201;
                            res.send(combinedPdf);
                        } else {
                            res.status = 500;
                            res.send("Server Error #");
                        }
                        FLDMNGR.removeLocalFolder(newDir);
                    }
                    else {
                        LOGGER.log('python combine script failed to create file');
                        res.status = 500;
                        res.send('Server Error #');
                        FLDMNGR.removeLocalFolder(newDir);
                    }
                });
                combinePy.stderr.on('data', (data) => {
                    LOGGER.log(`python Combine error: ${data.toString()}`);

                });
                combinePy.on('close', (code) => {
                    LOGGER.log(`python Combine exited with code ${code}`);
                });
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
    console.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to / for Instructions`);
    res.send('INSTRUCTIONS FOR APP USE\n' +
        'To auto fill customer information, click Import CSV\n\n' +
        'To Download equipment specsheets, have your equipment info selected ' +
        'then click "Download SpecSheets"\n\n' +
        'To Download a pdf of your CAD with specSheets attached,\n' +
        'make sure your equipment is selected and then click Attach SpecSheets\n' +
        'Then select your CAD you want pdfs attached to. Then look\n' +
        'for a pdf called "Combined Cad.pdf" in your current excel directory');
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
