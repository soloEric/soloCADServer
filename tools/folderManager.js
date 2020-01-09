const FS = require('fs');
const PATH = require('path');
module.exports = {

    // takes in base folder name, additional name to concat,
    // and creates the folder in the local directory
    createLocalFolder: (fileName) => {
        FS.mkdirSync(fileName);
    },

    // searches local directory for folder name supplied
    // deletes all files and folders within
    removeLocalFolder: (fileName) => {
        if (FS.existsSync(fileName)){
            FS.readdirSync(fileName).forEach((file, index) => {
                const currentPath = PATH.join(fileName, file);
                if (FS.lstatSync(currentPath).isDirectory()) {
                    this.removeLocalFolder(currentPath);
                } else {
                    FS.unlinkSync(currentPath);
                }
            });
            FS.rmdirSync(fileName);
        }
    }

};

