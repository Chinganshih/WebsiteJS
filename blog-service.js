var postArr = [];
var cateArr = [];

const { init } = require("express/lib/application");

module.exports.initialize = function() {
    const fs = require("fs");
    postArr = Object.values(JSON.parse(fs.readFileSync("./data/posts.json").toString()));
    fs.readFileSync("./data/posts.json", "utf8", (err, data) => {
        if (err) {
            console.log("Fail");
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject("unable to read posts.json file");
                })
            })
        }

    })

    cateArr = Object.values(JSON.parse(fs.readFileSync("./data/categories.json").toString()));
    fs.readFile("./data/categories.json", 'utf8', (err, data) => {
        if (err) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject("unable to read categories.json file");
                })
            })
        }
    })

    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("Successfully");
        })
    })
}

module.exports.getAllPosts = function() {
    if (postArr.length == 0) {

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject("no post result returned");
            })
        })
    } else {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(postArr);
            })
        })
    }


}

module.exports.getPublishedPosts = function() {
    var publishedPosts = postArr.filter(postArr => postArr.published == true);
    if (publishedPosts.length == 0) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject("no result returned");
            })
        })
    } else {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(publishedPosts);
            })
        })
    }
}

module.exports.getCategories = function() {

    if (cateArr.length == 0) {

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject("no categories result returned");
            })
        })
    } else {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(cateArr);
            })
        })
    }

}