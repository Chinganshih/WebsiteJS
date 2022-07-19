const Sequelize = require('sequelize');

var sequelize = new Sequelize('drnq2p1bqqihk', 'usxkvkrgnqxwli', 'e8329ea7bc9754817d97c8477c268a70f83062b0af3e0edd795eb6ccb62b00d8', {
    host: 'ec2-3-219-52-220.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Since a post belongs to a specific category, we must define a relationship between Posts and Categories
Post.belongsTo(Category, { foreignKey: 'category' });


module.exports.initialize = () => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch(() => {
            reject('unable to sync the database');
        });
    })


}

module.exports.getAllPosts = () => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Post.findAll().then((data) => {
                resolve(data);
            }).catch(() => {
                reject('no results returned');
            })
        })

    });

}

module.exports.getPostsByCategory = (cate) => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Post.findAll({
                where: {
                    category: cate
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('no results returned');
            })
        })

    });

}

module.exports.getPostsByMinDate = (minDateStr) => {

    const { gte } = Sequelize.Op;

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            }).then((data) => {
                resolve(data);
            }).catch(() => {
                reject('no results returned');
            })

        })

    });

}

module.exports.getPostById = (inid) => {

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            Post.findAll({
                where: {
                    id: inid
                }
            }).then((data) => {
                resolve(data[0])
            }).catch(() => {
                reject();
            })
        })

    });
}

module.exports.addPost = (postData) => {

    // Before we can work with postData correctly, we must once again make sure the published property is set properly.
    postData.published = (postData.published) ? true : false;
    postData.postDate = new Date();
    for (const prop in postData) {
        if (postData[prop] == "") {
            postData[prop] = null;
        }
    }

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            Post.create(postData).then(() => {
                console.log("add new post successfully.")
                resolve(postData)
            }).catch(() => {
                reject('unable to create post');
            })
        })

    });



}
module.exports.addCategory = (categoryData) => {
    for (const prop in categoryData) {
        if (categoryData[prop] == "") {
            categoryData[prop] = null;
        }
    }

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Category.create(categoryData).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('unable to create category')
            })
        })
    })
}

module.exports.getPublishedPosts = () => {

    return new Promise((resolve, reject) => {

        sequelize.sync().then(() => {
            Post.findAll({
                where: {
                    published: true
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('no results returned');
            })
        })

    });


}


module.exports.getPublishedPostsByCategory = (cate) => {

    console.log(cate)
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Post.findAll({
                where: {
                    published: true,
                    category: cate
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('no results returned');
            })
        })
    });


}

module.exports.getCategories = () => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {

            Category.findAll().then((data) => {
                resolve(data)
            }).catch(() => {
                reject('no results returned');
            })
        })
    });


}

module.exports.deleteCategoryId = (cateid) => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Category.destroy({
                where: {
                    id: cateid
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('cannot delete category id')
            })
        })
    })
}

module.exports.deletePostId = (postid) => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Post.destroy({
                where: {
                    id: postid
                }
            }).then((data) => {
                resolve(data)
            }).catch(() => {
                reject('cannot delete post id')
            })
        })
    })
}