module.exports = {
    log: (toLog) => {
        const fs = require('fs');
        let date = new Date();
        let fileName = `${__dirname}/../logs/${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}.txt`

        console.log(toLog);

        fs.appendFileSync(fileName, `\n${toLog}`, (err) => {

            if (err) {
                console.error(err.stack);
            };
        });
    }
};