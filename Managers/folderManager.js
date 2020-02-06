const FS = require('fs');
const PATH = require('path');
module.exports = {

    createLocalFolder: (fileName) => {
        FS.mkdirSync(fileName);
    },

    removeLocalFolder: (fileName) => {
        if (FS.existsSync(fileName)){
            FS.readdirSync(fileName).forEach((file) => {
                const currentPath = PATH.join(fileName, file);
                if (FS.lstatSync(currentPath).isDirectory()) {
                    this.removeLocalFolder(currentPath);
                } else {
                    FS.unlinkSync(currentPath);
                }
            });
            FS.rmdirSync(fileName);
        }
    },

    removeLocalFile: (fileName) => {
        if (FS.existsSync(fileName)) {
            FS.unlinkSync(fileName);
            return true;
        }
        else {
            return false;
        }
    }

};

