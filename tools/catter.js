module.exports = {

    //takes in JSON formatted objects/strings
    // returns a string of both JSONs concatenated
    jsonConcat: (json1, json2) => {
        var j1 = JSON.stringify(json1);
        var j2 = JSON.stringify(json2);
        j1 = j1.slice(0, -1) + ",";
        j2 = j2.substring(1, j2.length - 1);

        var catJson = j1 + j2;
        catJson = catJson + "}";
        return catJson;

    }
};
