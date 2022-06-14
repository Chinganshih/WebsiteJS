var postArr = [];
var cateArr = [];

const { init } = require("express/lib/application");

module.exports.initialize = () => {
    const fs = require("fs");
    postArr = Object.values(JSON.parse(fs.readFileSync("./data/posts.json").toString()));
    fs.readFileSync("./data/posts.json", "utf8", (err, data) => {
        if (err) {
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

module.exports.getAllPosts = () => {

    return new Promise((resolve, reject) => {
        if (postArr.length == 0) {
            reject("no post result returned");
        } else {
            resolve(postArr);
        }
    });

}

module.exports.getPublishedPosts = () => {
    var publishedPosts = postArr.filter(postArr => postArr.published == true);

    return new Promise((resolve, reject) => {
        if (publishedPosts.length == 0) {
            reject("no result returned");
        } else {
            resolve(publishedPosts);
        }
    });

}


module.exports.getCategories = () => {

    return new Promise((resolve, reject) => {
        if (cateArr.length == 0) {
            reject("no categories result returned");
        } else {
            resolve(cateArr);
        }

    });
}

module.exports.addPost = (postData) => {

    var isAdd = 0;
    // Explicitly set the id property of postData to be the length of the "posts" array plus one (1).  This will have the effect of setting the first new post's id to: 31, and so on.
    if (postData) {
        postData.id = (postArr.length) + 1;
        (postData.published) ? postData.published = true: postData.published = false;
        postArr.push(Object.assign({}, postData));
        isAdd = 1;
    }

    return new Promise((resolve, reject) => {
        if (isAdd) {
            resolve(postArr)
        } else {
            reject("No new post added")
        }

    })

}


module.exports.getPostsByCategory = (category) => {

    var postsByCategory = postArr.filter(postArr => postArr.category == category);
    return new Promise((resolve, reject) => {
        if (postsByCategory.length == 0) {
            reject("no result returned");
        } else {
            resolve(postsByCategory);
        }
    });
}

module.exports.getPostsByMinDate = (minDateStr) => {

    var postsByMinDate = postArr.filter(postArr => (new Date(postArr.postDate) >= new Date(minDateStr)));
    return new Promise((resolve, reject) => {
        if (postsByMinDate.length == 0) {
            reject("no result returned");
        } else {
            resolve(postsByMinDate);
        }
    });
}

module.exports.getPostById = (id) => {

    var postsById = postArr.filter(postArr => postArr.id == id);

    return new Promise((resolve, reject) => {
        if (postsById.length == 0) {
            reject("no result returned");
        } else {
            resolve(postsById);
        }
    });
}