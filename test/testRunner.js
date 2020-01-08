// Use to run automated requests to expressServer.js to test functionality
// 

var chai = require('chai');
var chaiHttp = require('chai-http');
const pdf = require('pdf-parse');
const path = require('path');

chai.use(chaiHttp);
var expect = chai.expect;

const target = 'http://192.168.0.126:8081';
const fs = require('fs');

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
    var createdPDF = false;
    it('Positive: Get Combined PDF', function (done) {
        this.timeout(5000);
        chai.request(target)
            .post('/pdfCombine')
            .set('Content-Type', 'application/octet-stream')
            .send(fs.readFileSync('./test/sendTest.zip'))
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                res.on('data', function (chunk) {
                    fs.appendFileSync(`${__dirname}\\testCombined.pdf`, chunk);

                });
                res.on('end', function () {
                    if (fs.existsSync(`${__dirname}\\testCombined.pdf`)) {
                        isValidPDF(fs.readFileSync(`${__dirname}\\testCombined.pdf`)).then(check => {
                            expect(check.isPDF).to.be.true;
                            createdPDF = true;
                            done();
                        });
                    } else {
                        console.log("File not written successfully");
                        createdPDF = false;
                        done();
                    }
                });
            });
    });

    it("Get Combined PDF: Successfully wrote to PDF", function (done) {
        expect(createdPDF).to.be.true;
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

    it("Test server response to unsupported pdfs");


    //************************************************************************************************ */

    after(function () {
        console.log("\ncalling cleanup")
        if (fs.existsSync(`${__dirname}\\testCombined.pdf`)) {
            fs.unlink(`${__dirname}\\testCombined.pdf`, (err) => {
                if (err) {
                    console.log("failed to clean up");
                } else {
                    console.log("Tests successfully cleaned up");
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
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
  }
