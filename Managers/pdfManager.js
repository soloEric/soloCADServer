const pdfLib = require('pdf-lib');
const FS = require('fs');

module.exports = {

    // given the file name of the first pdf, will load and locate the 
    // pdf files and compile them. Returns bytes. For some reason
    // sending these bytes directly won't return a valid pdf to the
    // client. But using fs, save to disk then read back into memory
    // and sending that to the client works
    compile: function (firstPdf, json) {
        const pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(firstPdf));
        for (key in json) {
            let bytes;
            const pdf = resolvePaths(json[key]);

            if (FS.existsSync(pdf)) {
                // console.log(`Exists: ${pdf}`);
                bytes = FS.readFileSync(pdf);
            } else {
                throw `PDF ${json[key]} unsupported`;
            }
            if (bytes) {
                const donorPDF = pdfLib.PDFDocumentFactory.load(bytes);
                for (let i = 0; i < donorPDF.getPages().length; ++i) {
                    pdfDoc.addPage(donorPDF.getPages()[i]);
                    // console.log('added page');
                }
            }
        }
        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    },

    // Given name of pdfs, will insert the first pdf into second 
    // at index. reqFolder should be the name of the folder 
    // where the pdf files are located
    // Note: untested as of 1/30/2020
    // FIXME :: validate index number
    insert: (toInsert, intoPdf, index, reqFolder) => {
        const pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFolder(intoPdf, reqFolder)));
        const donorPDF = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFolder(toInsert, reqFolder)));
        let i;
        let pgIndex = index - 1;
        const numPages = donorPDF.getPages().length;
        // console.log('numPages', numPages);
        for (i = 0; i < numPages; ++i) {
            const donorPage = donorPDF.getPages()[i];
            // console.log('insert index', pgIndex);
            pdfDoc.insertPage(pgIndex, donorPage);
            ++pgIndex;
        }
        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    },

    // Takes json from reqFolder as order list. Compiles pdfs
    // returns bytes.
    // untested as of 1/30/2020
    // check for protected pdfs submitted and handle those
    compileFromClient: (json, reqFolder) => {
        let count = 0;
        let pdfDoc;
        for (key in json) {
            if (count === 0) {
                pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFolder(json[key], reqFolder)));
            } else {
                const donorPDF = pdfLib.PDFDocumentFactory.load(FS.readFile(resolvePathFolder(json[key], reqFolder)));
                for (let i = 0; i < donorPDF.getPages().length; ++i) {
                    pdfDoc.addPage(donorPDF.getPages()[i]);
                }
            }
        }
        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    }
};

function getLastKey(json) {
    let last = '';
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            last = key;
        }
    }
    return last;
}

function resolvePaths(fileName) {
    return `${__dirname}\\..\\spec_sheets\\${fileName}`;
}
function resolvePathFolder(fileName, folder) {
    return `${__dirname}\\..\\${folder}\\${fileName}`;
}
