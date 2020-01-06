<<<<<<< HEAD
module.exports = {
    //returns a string of current timeStamp
    stamp: () => {
        let date = new Date();
        return `[${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}]::[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
    }
=======
module.exports = {
    //returns a string of current timeStamp
    stamp: () => {
        let date = new Date();
        return `[${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}]::[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`;
    }
>>>>>>> d3f4685089cc7861389430ca2e10aa1fb217952d
};