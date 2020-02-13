// Use to run automated requests to expressServer.js to test functionality
// 

var chai = require('chai');
var chaiHttp = require('chai-http');
const pdf = require('pdf-parse');
const AdmZip = require('adm-zip');
const path = require('path');
const pdfM = require('../Managers/pdfManager');
const INTERCON = require('../tools/interconnection');

const testJson = require('./compile_test_1/specList.json');
const interconTest1 = require('./interconTests/interconTest1.json');
const interconTest2 = require('./interconTests/interconTest2.json');
const interconTest3 = require('./interconTests/interconTest3.json');

chai.use(chaiHttp);
var expect = chai.expect;

const target = 'http://192.168.1.18:8080';
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
    it("Interconnections Test 1", done => {
        console.log(INTERCON.calculate(interconTest1, './'));
        done();

    });
    it("Interconnections Test 2", done => {
        console.log(INTERCON.calculate(interconTest2, './'));
        done();

    });
    it("Interconnections Test 3", done => {
        console.log(INTERCON.calculate(interconTest3, './'));
        done();

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
    //                 FS.writeFileSync(`${__dirname}/testCombined.pdf`, chunk);
    //             });
    //             res.on('end', function () {
    //                 if (FS.existsSync(`${__dirname}/testCombined.pdf`)) {
    //                     isValidPDF(FS.readFileSync(`${__dirname}/testCombined.pdf`)).then(check => {
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
        this.timeout(5000);
        chai.request(target)
            .post('/dwgImport')
            .set('Content-Type', 'application/json')
            .send(dwgImportPosData)
            .buffer()
            .parse(binaryParser)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(201);

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
        this.timeout(5000);
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

    it('pdfManager compile local test 1', function (done) {
        this.timeout(5000);
	firstPdf = `${__dirname}/compile_test_1/testCAD.pdf`;
        const bytes = pdfM.compileLocal(firstPdf, testJson);

        FS.writeFileSync(`${__dirname}/compiledCad.pdf`, bytes);
        expect(FS.existsSync(`${__dirname}/compiledCad.pdf`)).to.be.true;
        done();

    });

    it ('pdfManager compile client test 1', function (done) {
        // const json = require('./compile_client_test_1/order.json');
        // json = JSON.parse(json);
        let bytes = pdfM.compile('test/compile_client_test_1');
        expect(bytes).to.not.be.NaN;
        if (bytes) {
            FS.writeFileSync(`${__dirname}/compile_client_test_1.pdf`, bytes);
        }
        done();
    });

    it('pdfManager insert test 1: Single Page insert', function (done) {
        this.timeout(5000);
	let insert;
        let into;

        const files = FS.readdirSync(`${__dirname}/insert_test_1`);
        for (const file of files) {
            if (file == 'exCAD.pdf') {
                into = file;
            }
            if (file == 'singlePage.pdf') {
                insert = file;
            }
        }
        let bytes;
        try {
            bytes = pdfM.insert(insert, into, 2, 'test/insert_test_1');
        } catch (err) {
            console.log(err);
            bytes = NaN;
        }
        expect(bytes).to.not.be.NaN;
        if (bytes) {
            FS.writeFileSync(`${__dirname}/insert_test_1.pdf`, bytes);
        }
        done();
    });

    it('pdfManager insert test 2: Multiple Page insert', function (done) {
        this.timeout(5000);
	let insert;
        let into;

        const files = FS.readdirSync(`${__dirname}/insert_test_2`);
        for (const file of files) {
            if (file == 'exCAD.pdf') {
                into = file;
            }
            if (file == 'multiplePages.pdf') {
                insert = file;
            }
        }
        let bytes;
        try {
            bytes = pdfM.insert(insert, into, 2, 'test/insert_test_2');
        } catch (err) {
            console.log(err);
            bytes = NaN;
        }
        expect(bytes).to.not.be.NaN;
        if (bytes) {
            FS.writeFileSync(`${__dirname}/insert_test_2.pdf`, bytes);
        }
        done();
    });

    it('pdfManager insert test 3: Index Boundaries', function (done) {
        this.timeout(5000);
	let insert;
        let into;

        const files = FS.readdirSync(`${__dirname}/insert_test_2`);
        for (const file of files) {
            if (file == 'exCAD.pdf') {
                into = file;
            }
            if (file == 'multiplePages.pdf') {
                insert = file;
            }
        }
        let bytes;
        try {
            bytes = pdfM.insert(insert, into, 0, 'test/insert_test_2');
        } catch (err) {
            // console.log(err);
            bytes = NaN;
        }
        expect(bytes).to.be.NaN;
        try {
            bytes = pdfM.insert(insert, into, 11, 'test/insert_test_2');
        } catch (err) {
            // console.log(err);
            bytes = NaN;
        }
        expect(bytes).to.be.NaN;
        done();
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

    //************************************************************************************************ */

    before(function (done) {
        console.log('\t------setting up------');
        if (FS.existsSync('test/pos_test_dwg_import.json')) {
            FS.readFile('test/pos_test_dwg_import.json', function (err, data) {
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
        if (FS.existsSync('test/neg_test_dwg_import.json')) {
            FS.readFile('test/neg_test_dwg_import.json', function (err, data) {
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
        if (FS.existsSync(`${__dirname}/testCombined.pdf`)) {
            FS.unlink(`${__dirname}/testCombined.pdf`, (err) => {
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
        if (FS.existsSync(`${__dirname}/compiledCad.pdf`)) {
            FS.unlink(`${__dirname}/compiledCad.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("removed compiledCad.pdf");
                }
            });
        }
        if (FS.existsSync(`${__dirname}/insert_test_1.pdf`)) {
            FS.unlink(`${__dirname}/insert_test_1.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("removed insert_test_1.pdf");
                }
            });
        }
        if (FS.existsSync(`${__dirname}/insert_test_2.pdf`)) {
            FS.unlink(`${__dirname}/insert_test_2.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("removed insert_test_2.pdf");
                }
            });
        }
        
        if (FS.existsSync(`${__dirname}/compile_client_test_1.pdf`)) {
            FS.unlink(`${__dirname}/compile_client_test_1.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("compile_client_test_1.pdf");
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
