const pdfMerge = require('pdf-merge');
const FS = require('fs');

module.exports = {

    compile: async function (firstPdf, json, destFile) {

        let pdfs = [];
        pdfs.push(firstPdf);
        for (key in json) {
            pdfs.push(resolvePaths(json[key]));
        }
        if (destFile) {
            // write to file
            return pdfMerge(pdfs, { output: `${destFile}` });
        }
        else {
            //return buffer
            return pdfMerge(pdfs);
        }

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
