
const CATTER = require('./tools/catter');
const TIMESTAMP = require('./tools/timeStamp');
const LOGGER = require('./tools/logger');
const HOST_NAME = '192.168.0.126';
const PORT = '8080';



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
    'combinePy': './pythonScripts/spec_sheet_compiler_SERVER.py'
}

const MIME_TYPE = {
    '.dwg': 'application/acad',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
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

//TODO:: 
// Switch python script from test script to python calculations/dwg selection
// Wrap python script calls in Promises
// test sending back data to the client after python script
// option1: Attempt to handle file return in one post request
// option2: create session folder titled after customer name and requesting ip
//          create packaged files there in python, wait for client to request files

// Client sends JSON file with python function parameters
// Server calls functions referenced in JSON file with parameters parsed from JSON
APP.route('/postJSON').post(JSON_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /postJSON`);
    LOGGER.log(JSON.stringify(req.body));
    const pyParams = req.body;
    //console.log(pyParams[0].Module)
    // console.log(`calling pyton test script with arg ${pyParams[0].Module}`);
    const testPromise = new Promise((resolve, reject) => {
        const pythonTest = SPAWN('python', [PYTHON_SCRIPTS['test'], pyParams['xl_inverter_pn']]);
        pythonTest.stdout.on('data', (data) => {

            if (data) {
                resolve(`node logging data from python: ${data.toString()}`);
            }
            else {
                reject(new Error('Python not executed'));
            }
        });

    });

    const callPromise = function () {
        testPromise
            .then(resolveMsg => {
                console.log(resolveMsg);
                res.statusCode = 201;
                res.send();
            })
            .catch(error => {
                console.log(error);
                res.statusCode = 500;
                res.send("Internal Error, python script not executed");
            });
    }

    callPromise();

});

APP.route('/pdfCombine').post(RAW_PARSER, function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombine`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}.zip`
    req.pipe(FS.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        FS.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                serverFailureCleanup(res, "Server did not accept File", err, new Array(`${__dirname}/${serverZipFileName}`), null);
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
                    serverFailureCleanup(res, "Server Failure: extraction", error, new Array(`${__dirname}/${serverZipFileName}`), new Array(newDir));
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
                            serverFailureCleanup(res, 'Server Failure: Python failed', null, null);
                        }
                        //delete files from server
                        files = FS.readdirSync(newDir);
                        for (const file of files) {
                            FS.unlinkSync(PATH.join(newDir, file), err => {
                                if (err) throw err;
                            })
                        }
                        FS.rmdirSync(newDir);
                    }
                    else {
                        LOGGER.log('python combine script failed to create file');
                        res.status = 500;
                        res.send('Internal Server Error: Python failed');
                        serverFailureCleanup(res, 'Server Failure: Python failed', null, new Array(newDir));
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

//test route, currently returns hard coded string from python script 
// FIXME: take in JSON string from excel http request
// pass in args to python dwg retrieval
// get dwg paths from python
// send zip file as response
APP.route('/request_dwg').get(function (req, res, next) {
    LOGGER.log(`\n${TIMESTAMP.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /request_dwg`);
    //LOGGER.log(JSON.stringify(req.body));
    //const pyParams = req.body;
    const dwgPromise = new Promise((resolve, reject) => {
        const dwgRequest = SPAWN('python', [PYTHON_SCRIPTS['testDwg'], null]);
        dwgRequest.stdout.on('data', (data) => {

            if (data) {
                LOGGER.log('retrieving files:');
                resolve(JSON.parse(data));
            }
            else {
                reject(new Error('Python not executed'));
            }
        });
    });
    const callDwgRequest = function () {
        // file data will hold the data of all files to be put in the zip folder
        let fileData = [];
        dwgPromise
            .then(filePaths => {
                const zip = new AdmZip();
                zip.add
                for (let path of Object.values(filePaths)) {
                    LOGGER.log(path)
                    zip.addLocalFile(path);
                }
                const data = zip.toBuffer();
                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', data.length);
                res.send(data);
                LOGGER.log("Zip Sent")
            })
            .catch(error => {
                LOGGER.log(error);
                res.statusCode = 500;
                res.send("Internal Error");
            })
    }
    callDwgRequest();
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

// Takes a server response and sends the response msg
// deletes files and folders from list
// TODO: create more specific error handling
function serverFailureCleanup(res, responseMsg, err, fileList, folderList) {
    res.statusCode = 500;
    res.send(responseMsg);
    try {
        if (fileList != null) {
            fileList.forEach(element => {
                if (FS.existsSync(element)) {
                    FS.unlinkSync(element);
                }
            });
        }
        if (folderList != null) {
            folderList.forEach(element => {
                if (FS.existsSync(element)) {
                    FS.readdirSync(element, function (err, files) {
                        if (err) {
                            LOGGER.log("Error occured in serverFailureCleanup");
                            return;
                        } else {
                            if (!files.length) {
                                FS.rmdirSync(element);
                            } else {
                                for (const file of files) {
                                    FS.unlinkSync(path.join(folder, file));
                                }
                                FS.rmdirSync(element);
                            }
                        }
                    });
                }
            });
        }
    } catch (error) {
        LOGGER.log("Clean up failed", error);
    }
    LOGGER.log(`Server Failed with error: ${err}\nCleaning files`);
}

