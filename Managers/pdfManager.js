const pdfLib = require('pdf-lib');
const FS = require('fs');

module.exports = {

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

    insert: (toInsert, intoPdf, afterPageNum, reqFolder) => {

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
