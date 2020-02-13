module.exports = {
    //returns a string of current timeStamp
    stamp: () => {
        let date = new Date();
        return `[${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}]::[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
    }

};