const pdfLib = require('pdf-lib');
const FS = require('fs');

module.exports = {

    merge: (pdfFileList, reqFolder) => {

    },

    compile: async function (firstPdf, json, reqFolder) {
        const pdfDoc = await pdfLib.PDFDocument.load(FS.readFileSync(`${__dirname}\\..\\${reqFolder}\\${firstPdf}`));
        let lastKey = getLastKey(json);

        let pdfs = [];
        for (const key of Object.keys(json)) {
            console.log(`Loading: ${json[key]}`);
            pdfs.push(await loadPdfFromPath(json[key]));
        }

        let promises = [];

        for (const pdf in pdfs) {
            promises.push(async function () {
                const copiedPages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    addTo.addPage(page);
                });
            });
        }
        promises.push(await getBytes(pdfDoc));
        Promise.all(promises).then((data) => {
            return data;
        }, (err) => {
            console.log(err);
        });

        // return new Promise((resolve) => {
        //     for (const key of Object.keys(json)) {
        //         // console.log(`${__dirname}\\..\\spec_sheets\\${json[key]}`);
        //         if (FS.existsSync(`${__dirname}/../spec_sheets/${json[key]}`)) {
        //             try {
        //                 FS.readFile(`${__dirname}\\..\\spec_sheets\\${json[key]}`, async function (err, buf) {
        //                     if (err) {
        //                         // shit
        //                     } else {
        //                         const addPdf = await pdfLib.PDFDocument.load(buf);
        //                         console.log(`adding ${json[key]}`);
        //                         const copiedPages = await pdfDoc.copyPages(addPdf, addPdf.getPageIndices());
        //                         copiedPages.forEach((page) => {
        //                             pdfDoc.addPage(page);
        //                         });
        //                         console.log(pdfDoc.getPageCount());
        //                         if (key === lastKey) {
        //                             console.log('writing to buffer');
        //                             await pdfDoc.save().then(function (bytes) {
        //                                 resolve(bytes);
        //                             });

        //                         }
        //                     }
        //                 });
        //             } catch (error) {
        //                 // console.log(error);
        //                 continue;
        //             }
        //         }
        //     }

        // });
    },

    insert: (toInsert, intoPdf, afterPageNum, reqFolder) => {

    }

};
async function getBytes(pdfDoc) {
    return await pdfDoc.save();
}

function getLastKey(json) {
    let last = '';
    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            last = key;
        }
    }
    return last;
}

function loadPdfFromPath(path) {
    return pdfLib.PDFDocument.load(FS.readFileSync(`${__dirname}\\..\\spec_sheets\\${path}`));
}

// async function addToEndOf(toAdd, addTo) {
//     const copiedPages = await addTo.copyPages(toAdd, toAdd.getPageIndices());
//     copiedPages.forEach((page) => {
//         addTo.addPage(page);
//     });
// }