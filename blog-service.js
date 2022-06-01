// var postJSON = require("./data/posts.json");
// var categoriesJSON = require("./data/categories.json");

// var post = JSON.parse(JSON.stringify(postJSON));
// var categories = JSON.parse(JSON.stringify(categoriesJSON));

// post = Object.entries(post);
// categories = Object.entries(categories);

// console.log(categories);

function initialize() {
    const fs = require("fs");
    fs.readFile("./data/posts.json", 'utf8', (err, data) => {
        var postArr = Object.entries(JSON.parse(data));
        if (err) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject("unable to read posts.json file");
                })
            })
        }
    })

    fs.readFile("./data/categories.json", 'utf8', (err, data) => {
        var cateArr = Object.entries(JSON.parse(data));
        // console.log(cateArr);
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

initialize();
initialize().then(function(data) {
    console.log(data);
})