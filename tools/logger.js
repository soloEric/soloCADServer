module.exports = {
    log: (toLog) => {
        const fs = require('fs');
        let date = new Date();
        let fileName = `${__dirname}/logs/${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}.txt`
        // if (!fs.exists(fileName)) {

        // } 
        fs.appendFileSync(fileName, `\n${toLog}`, (err) => {
            console.log(toLog);
            if (err) {
                console.error(err.stack);
            };
        });
    }
};