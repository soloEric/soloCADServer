const pdfLib = require('pdf-lib');
const FS = require('fs');

module.exports = {

    // given the file name of the first pdf, will load and locate the 
    // pdf files and compile them. Returns bytes. For some reason
    // sending these bytes directly won't return a valid pdf to the
    // client. But using fs, save to disk then read back into memory
    // and sending that to the client works
    compileLocal: (firstPdf, json) => {
        const pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(firstPdf));
        let added = [];
        for (key in json) {
            let bytes;
            const pdf = resolvePaths(json[key]);
            let result = added.find(ele => ele == json[key]);
            if (FS.existsSync(pdf)) {
                // console.log(`Exists: ${pdf}`);
                if (!result) {
                    bytes = FS.readFileSync(pdf);
                }
            } else {
                throw `PDF ${json[key]} unsupported`;
            }
            if (bytes) {
                const donorPDF = pdfLib.PDFDocumentFactory.load(bytes);
                for (let i = 0; i < donorPDF.getPages().length; ++i) {
                    pdfDoc.addPage(donorPDF.getPages()[i]);
                    // console.log('added page');
                }
                added.push(json[key]);
            }
        }
        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    },

    // Given name of pdfs, will insert the first pdf into second 
    // at index. reqFolder should be the name of the folder 
    // where the pdf files are located
    insert: (toInsert, intoPdf, index, reqFolder) => {
        let pdfDoc;
        let donorPDF;

        try {
            pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(intoPdf, reqFolder)));
            donorPDF = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(toInsert, reqFolder)));
        } catch {
            throw "Error reading file";
        }
        let i;
        let pgIndex = index - 1;

        if (pgIndex < 0 || pgIndex > pdfDoc.getPages().length) {
            throw "Index is too large or too small";
        }

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

    // NOT NEEDED AS OF 1/31/2020
    // Takes json from reqFolder as order list. Compiles pdfs
    // returns bytes.
    // untested as of 1/30/2020
    // check for protected pdfs submitted and handle those
    compileJson: (json, reqFolder) => {
        let count = 0;
        let pdfDoc;
        for (key in json) {
            if (count === 0) {
                pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(json[key], reqFolder)));
            } else {
                const donorPDF = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(json[key], reqFolder)));
                for (let i = 0; i < donorPDF.getPages().length; ++i) {
                    pdfDoc.addPage(donorPDF.getPages()[i]);
                }
            }
        }
        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    },

    // Takes in folder where pdfs are located
    // pdfs should be named as numbers to reflect order, starting from 1
    // returns bytes of compiles pdf
    compile: (reqFolder) => {
        const files = FS.readdirSync(resolvePathFolder(reqFolder));
        let pdfDoc;
        for (let i = 0; i < files.length; ++i) {
            // console.log(files[i]);
            if (files[i] === "1.pdf") {
                pdfDoc = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(files[i], reqFolder)));
            }
            else {
                const donorPDF = pdfLib.PDFDocumentFactory.load(FS.readFileSync(resolvePathFile(files[i], reqFolder)));
                for (let j = 0; j < donorPDF.getPages().length; ++j) {
                    pdfDoc.addPage(donorPDF.getPages()[j]);
                }
            }
        }

        return pdfLib.PDFDocumentWriter.saveToBytes(pdfDoc);
    },

    // FIXME: Complete this
    extractPages: (reqFolder, pdf, pgNumStr) => {
        let pdfDoc;
        // parse with , deliminator
        // parse range/single int
        // create extracted pages
        // 
    }
};



function resolvePaths(fileName) {
    return `${__dirname}/../spec_sheets/${fileName}`;
}
function resolvePathFile(fileName, folder) {
    return `${__dirname}/../${folder}/${fileName}`;
}
function resolvePathFolder(folder) {
    return `${__dirname}/../${folder}`;
}