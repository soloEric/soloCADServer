// Use to run automated requests to expressServer.js to test functionality
// 

var chai = require('chai');
var chaiHttp = require('chai-http');
const pdf = require('pdf-parse');
const AdmZip = require('adm-zip');
const path = require('path');
const pdfM = require('../Managers/pdfManager');

const testJson = require('./test_files/specList.json');

chai.use(chaiHttp);
var expect = chai.expect;

const target = 'http://192.168.0.126:8081';
const FS = require('fs');
var dwgImportPosData;
var dwgImportNegData;

describe("Server Functionality Test", () => {
    it("Test unhandled paths", done => {
        chai.request(target)
            .get('/unhandled')
            .send()
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                done();
            });
    })
    it("Get Instructions String", done => {
        chai.request(target)
            .get('/')
            .send()
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.not.be.NaN;
                done();

            });
    });
    // var createdPDF = false;
    // it('Positive: Get Combined PDF', function (done) {
    //     this.timeout(5000);
    //     chai.request(target)
    //         .post('/pdfCombine')
    //         .set('Content-Type', 'application/octet-stream')
    //         .send(FS.readFileSync('./test/testValidPdf.zip'))
    //         .end(function (err, res) {
    //             expect(err).to.be.null;
    //             expect(res).to.have.status(200);
    //             res.on('data', function (chunk) {
    //                 FS.writeFileSync(`${__dirname}\\testCombined.pdf`, chunk);
    //             });
    //             res.on('end', function () {
    //                 if (FS.existsSync(`${__dirname}\\testCombined.pdf`)) {
    //                     isValidPDF(FS.readFileSync(`${__dirname}\\testCombined.pdf`)).then(check => {
    //                         expect(check.isPDF).to.be.true;
    //                         createdPDF = true;
    //                         done();
    //                     });
    //                 } else {
    //                     console.log("File not written successfully");
    //                     createdPDF = false;
    //                     done();
    //                 }
    //             });
    //         });
    // });

    // it("Get Combined PDF: Successfully wrote to PDF", function (done) {
    //     expect(createdPDF).to.be.true;
    //     done();
    // });



    it("Test server response to unsupported pdfs");

    it("DwgImport: valid paths", function (done) {
        this.timeout(3000);
        chai.request(target)
            .post('/dwgImport')
            .set('Content-Type', 'application/json')
            .send(dwgImportPosData)
            .buffer()
            .parse(binaryParser)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                let zip = new AdmZip(res.body);
                const zipEntries = zip.getEntries();
                expect(zipEntries.length).to.equal(5);
                zip.extractAllTo(`${__dirname}`);

                let batt = false;
                let comp = false;
                let intercon = false;
                let meter = false;
                let other = false;
                for (const file of zipEntries) {
                    switch (file.name) {
                        case 'batt.dwg':
                            batt = true;
                        case 'company_logo.dwg':
                            comp = true;
                        case 'interconnections.dwg':
                            intercon = true;
                        case 'meter_boi.dwg':
                            meter = true;
                        case 'other_sld.dwg':
                            other = true;
                        default:
                        // console.log(`${file.name} shouldn't be here`);
                    }
                }
                expect(batt && comp && intercon && meter && other).to.be.true;
                done();
            });
    });
    it("DwgImport: invalid fileNames", function (done) {
        this.timeout(3000);
        //console.log(dwgImportPosData);
        chai.request(target)
            .post('/dwgImport')
            .set('Content-Type', 'application/json')
            .set('Accept', 'text/plain')
            .send(dwgImportNegData)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res.text).to.equal('Server Error');
                done();
            });
    });

    it("server should remove local files related to request", function (done) {

        const dirs = getDirectories('./');
        // console.log(dirs);
        for (const dir of dirs) {
            if (dir.includes("192.168")) {
                expect(false).to.be.true;
                done();
            }
        }
        done();
    });

    it('pdfManager compile test 1', function (done) {
        firstPdf = `${__dirname}\\test_files\\testCAD.pdf`;
        const bytes = pdfM.compile(firstPdf, testJson);
        
        FS.writeFileSync(`${__dirname}\\compiledCad.pdf`, bytes);
        expect(FS.existsSync(`${__dirname}\\compiledCad.pdf`)).to.be.true;
        done();

    });

    //************************************************************************************************ */

    before(function (done) {
        console.log('\t------setting up------');
        if (FS.existsSync('test\\pos_test_dwg_import.json')) {
            FS.readFile('test\\pos_test_dwg_import.json', function (err, data) {
                if (err) console.log(err);
                else {
                    dwgImportPosData = JSON.parse(data);
                }
            });
        }
        else {
            console.log('major fuckup happened');
            done();
        }
        if (FS.existsSync('test\\neg_test_dwg_import.json')) {
            FS.readFile('test\\neg_test_dwg_import.json', function (err, data) {
                if (err) console.log(err);
                else {
                    dwgImportNegData = JSON.parse(data);
                    done();
                }
            });
        }
        else {
            console.log('major fuckup happened');
            done();
        }
    });

    after(function () {
        console.log("\ncalling cleanup")
        if (FS.existsSync(`${__dirname}\\testCombined.pdf`)) {
            FS.unlink(`${__dirname}\\testCombined.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("removed testCombined.pdf");
                }
            });
        }
        let files = FS.readdirSync(`${__dirname}`);
        for (const file of files) {
            if (file.substr(file.length - 4) == '.dwg') {
                FS.unlinkSync(path.join(__dirname, file));
            }
        }
        if (FS.existsSync(`${__dirname}\\compiledCad.pdf`)) {
            FS.unlink(`${__dirname}\\compiledCad.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("removed pdfTest.pdf");
                }
            });
        }
    });
});

function isValidPDF(buffer) {
    return pdf(buffer).then(function (data) {
        // console.log('returning valid pdf');
        return { isPDF: true, info: data.info };
    }, (err) => {
        // console.log('returning invalid pdf');
        return { isPDF: false, info: null };
    });
}

function getDirectories(path) {
    return FS.readdirSync(path).filter(function (file) {
        return FS.statSync(path + '/' + file).isDirectory();
    });
}

function binaryParser(res, callback) {
    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
        callback(null, Buffer.from(res.data, 'binary'));
    });
}