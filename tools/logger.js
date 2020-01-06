<<<<<<< HEAD
module.exports = {
    logger: (toLog) => {
        const fs = require('fs');
        let date = new Date();
        let fileName = `./logs/${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}.txt`
        // if (!fs.exists(fileName)) {

        // } 
        fs.appendFile(fileName, `\n${toLog}`, (err) => {
            console.log(toLog);
            if (err) {
                console.error(err.stack);
            };
        });
    }
=======
module.exports = {
    logger: (toLog) => {
        const fs = require('fs');
        let date = new Date();
        let fileName = `./logs/${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}.txt`
        // if (!fs.exists(fileName)) {

        // } 
        fs.appendFile(fileName, `\n${toLog}`, (err) => {
            console.log(toLog);
            if (err) {
                console.error(err.stack);
            };
        });
    }
>>>>>>> d3f4685089cc7861389430ca2e10aa1fb217952d
};