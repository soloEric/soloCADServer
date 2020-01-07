
const catter = require('./tools/catter');
const timeStamp = require('./tools/timeStamp');
const logger = require('./tools/logger');
const hostName = '192.168.0.126';
const port = '8080';



//const companiesJSON = require('./equipment_data/companies.json');
const modulesJSON = require('./equipment_data/modules.json');
const invertersJSON = require('./equipment_data/inverters.json');
const railingsJSON = require('./equipment_data/railings.json');
const attachmentsJSON = require('./equipment_data/attachments.json')

const spawn = require('child_process').spawn;
const AdmZip = require('adm-zip');

const fs = require('fs');
// const url = require('url');
const path = require('path');

const pythonScripts = {
    //add key/val pair of python script name and the  relative path to the script

    'combinePy': './pythonScripts/spec_sheet_compiler_SERVER.py'
}

const mimeType = {
    '.dwg': 'application/acad',
    '.pdf': 'application/pdf',
    '.json': 'application/json'
}

const express = require('express');
const queue = require('express-queue');
const app = express();
const bodyParser = require('body-parser');

app.use(queue({ activeLimit: 2, queuedLimit: -1 }));
app.use(errorHandler);
app.use(logErrors);
const jsonParser = bodyParser.json();

const rawParser = function (req, res, next) {
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
    console.error(timeStamp.stamp(), err.stack);
    logger.logger(err.stack);
    next(err);
}

//TODO:: 
// Wrap python script calls in Promises
// test sending back data to the client after python script
// option1: Attempt to handle file return in one post request
// option2: create session folder titled after customer name and requesting ip
//          create packaged files there in python, wait for client to request files

// Client sends JSON file with python function parameters
// Server calls functions referenced in JSON file with parameters parsed from JSON
app.route('/postJSON').post(jsonParser, function (req, res, next) {
    logger.logger(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /postJSON`);
    logger.logger(JSON.stringify(req.body));
    const pyParams = req.body;
    //console.log(pyParams[0].Module)
    // console.log(`calling pyton test script with arg ${pyParams[0].Module}`);
    const testPromise = new Promise((resolve, reject) => {
        const pythonTest = spawn('python', [pythonScripts['test'], pyParams['xl_inverter_pn']]);
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

app.route('/pdfCombine').post(rawParser, function (req, res, next) {
    logger.logger(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /pdfCombine`);

    let serverZipFileName = `${req.connection.remoteAddress.substring(7)}_${Date.now()}.zip`
    req.pipe(fs.createWriteStream(`${__dirname}/${serverZipFileName}`));
    try {
        fs.appendFile(`${__dirname}/${serverZipFileName}`, req.rawBody, function (err) {
            if (err) {
                serverFailureCleanup(res, "Server did not accept File", err, new Array(`${__dirname}/${serverZipFileName}`), null);
            } else {
                logger.logger(`Writing to file: ${serverZipFileName}`);

                //unzip file
                let newDir = __dirname + "\\" + serverZipFileName.substring(0, serverZipFileName.length - 4);
                try {
                    let zip = new AdmZip(`${__dirname}/${serverZipFileName}`);
                    
                    if (!fs.existsSync(newDir)) {
                        fs.mkdirSync(newDir);
                        zip.extractAllTo(newDir);
                        fs.unlinkSync(__dirname + "\\" + serverZipFileName);
                    }
                } catch (error) {
                    serverFailureCleanup(res, "Server Failure: extraction", error, new Array(`${__dirname}/${serverZipFileName}`), new Array(newDir));
                }
                let files = fs.readdirSync(newDir);
                let pdfName;
                for (const file of files) {
                    logger.logger(`Loading Parameter: ${file}`);
                    if (file.substring(file.length - 4) === ".pdf") {
                        pdfName = file;
                    }
                }
                const pyJSON = fs.readFileSync(newDir + "\\specList.json");
                //Call Python to create pdf
                const combinePy = spawn('python', [pythonScripts['combinePy'], newDir, pdfName, pyJSON]);
                combinePy.stdout.on('data', (data) => {
                    if (data) {
                        logger.logger(`Python pdf combine returned with response: ${data.toString()}`);
                        //respond to client with pdf

                        if (fs.existsSync(newDir + '/Combined CAD.pdf')) {
                            //return combined pdf
                            let combinedPdf = fs.readFileSync(newDir + '/Combined CAD.pdf')
                            res.status = 201;
                            res.send(combinedPdf);
                        } else {
                            serverFailureCleanup(res, 'Server Failure: Python failed', null, null);
                        }
                        //delete files from server
                        files = fs.readdirSync(newDir);
                        for (const file of files) {
                            fs.unlinkSync(path.join(newDir, file), err => {
                                if (err) throw err;
                            })
                        }
                        fs.rmdirSync(newDir);
                    }
                    else {
                        logger.logger('python combine script failed to create file');
                        res.status = 500;
                        res.send('Internal Server Error: Python failed');
                        serverFailureCleanup(res, 'Server Failure: Python failed', null, new Array(newDir));
                    }
                });
                combinePy.stderr.on('data', (data) => {
                    logger.logger(`python Combine error: ${data.toString()}`);

                });
                combinePy.on('close', (code) => {
                    logger.logger(`python Combine exited with code ${code}`);
                });
            }
        });
    } catch (err) {
        logger.logger(err);
    }
});

//test route, currently returns hard coded string from python script 
// FIXME: take in JSON string from excel http request
// pass in args to python dwg retrieval
// get dwg paths from python
// send zip file as response
app.route('/request_dwg').get(function (req, res, next) {
    logger.logger(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /request_dwg`);
    //logger.logger(JSON.stringify(req.body));
    //const pyParams = req.body;
    const dwgPromise = new Promise((resolve, reject) => {
        const dwgRequest = spawn('python', [pythonScripts['testDwg'], null]);
        dwgRequest.stdout.on('data', (data) => {

            if (data) {
                logger.logger('retrieving files:');
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
                    logger.logger(path)
                    zip.addLocalFile(path);
                }
                const data = zip.toBuffer();
                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', data.length);
                res.send(data);
                logger.logger("Zip Sent")
            })
            .catch(error => {
                logger.logger(error);
                res.statusCode = 500;
                res.send("Internal Error");
            })
    }
    callDwgRequest();
});

// This option is currently not needed
// Client requests a list of available equipment to populate dropdowns in excel file
app.route('/requestEquip').get(function (req, res, next) {
    console.log(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /requestEquip`);
    res.statusCode = 200;
    res.set('Content-Type', mimeType['.json']);


    //let jsonSTR = catter.jsonConcat(companiesJSON, modulesJSON);
    let jsonSTR = catter.jsonConcat(modulesJSON, invertersJSON);
    //jsonSTR = catter.jsonConcat(JSON.parse(jsonSTR), invertersJSON);
    jsonSTR = catter.jsonConcat(JSON.parse(jsonSTR), railingsJSON);
    jsonSTR = catter.jsonConcat(JSON.parse(jsonSTR), attachmentsJSON);
    //console.log(JSON.parse(jsonSTR));
    res.send(jsonSTR);

});

//default pathway
app.get('/', (function (req, res, next) {
    console.log(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to / for Instructions`);
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
app.use(function (req, res, next) {
    logger.logger(`\n${timeStamp.stamp()}\n:: ${req.method} request from ${req.connection.remoteAddress} to /unhandled_route\nError 404 sent to Client`);
    res.status(404);
    res.send("Error 404: Resource not found");
    next();
});

var server = app.listen(port, function () {
    console.log(`server running on ${hostName}:${port}\n`);
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
                if (fs.existsSync(element)) {
                    fs.unlinkSync(element);
                }
            });
        }
        if (folderList != null) {
            folderList.forEach(element => {
                if (fs.existsSync(element)) {
                    fs.readdirSync(element, function (err, files) {
                        if (err) {
                            logger.logger("Error occured in serverFailureCleanup");
                            return;
                        } else {
                            if (!files.length) {
                                fs.rmdirSync(element);
                            } else {
                                for (const file of files) {
                                    fs.unlinkSync(path.join(folder, file));
                                }
                                fs.rmdirSync(element);
                            }
                        }
                    });
                }
            });
        }
    } catch (error) {
        logger.logger("Clean up failed", error);
    }
    logger.logger(`Server Failed with error: ${err}\nCleaning files`);
}

