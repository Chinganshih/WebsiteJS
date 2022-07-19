/*********************************************************************************
 *  WEB322 – Assignment 05
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: _ChingAn, Shih_ Student ID: _148221195_ Date: __2022-07-19__
 *
 *  Online (Heroku) URL:  https://pure-cove-51624.herokuapp.com/
 *
 *  GitHub Repository URL: __ https://github.com/Chinganshih/web322-app.git____
 *
 ********************************************************************************/

//  Host: ec2-3-219-52-220.compute-1.amazonaws.com
//  Database: drnq2p1bqqihk
//  User: usxkvkrgnqxwli
//  Port: 5432
//  Password: e8329ea7bc9754817d97c8477c268a70f83062b0af3e0edd795eb6ccb62b00d8
//  URI: postgres://usxkvkrgnqxwli:e8329ea7bc9754817d97c8477c268a70f83062b0af3e0edd795eb6ccb62b00d8@ec2-3-219-52-220.compute-1.amazonaws.com:5432/drnq2p1bqqihk
//  Heroku CLI: heroku pg:psql postgresql-deep-59001 --app pure-cove-51624


var blog_service = require("./blog-service.js");
var path = require("path");
var express = require("express");
var app = express();

// Inside your server.js file "require" the libraries
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphs = require('express-handlebars');
const stripJs = require('strip-js');
const blogData = require("./blog-service");

// This will tell our server that any file with the “.hbs” extension (instead of “.html”) will use the handlebars “engine” (template engine).
app.engine('.hbs', exphs.engine({
    extname: '.hbs',
    helpers: {
        // This basically allows us to replace all of our existing navbar links, ie: <li><a href="/about">About</a></li> with code that looks like this {{#navLink "/about"}}About{{/navLink}}.  
        // The benefit here is that the helper will automatically render the correct <li> element add the class "active" if app.locals.activeRoute matches the provided url, ie "/about"
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },

        // This helper will give us the ability to evaluate conditions for equality, ie {{#equals "a" "a"}} … {{/equals}} will render the contents, since "a" equals "a". 
        // It's exactly like the "if" helper, but with the added benefit of evaluating a simple expression for equality
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },

        // we will use a custom helper called safeHTML that removes unwanted JavaScript code from our post body string by using a custom package: strip-js
        safeHTML: function(context) {
            return stripJs(context);
        },


        formatDate: function(dateObj) {
            // console.log(dateObj)
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }

    }
}));

app.set('view engine', 'hbs');

// Set the cloudinary config to use your "Cloud Name", "API Key" and "API Secret" values
cloudinary.config({
    cloud_name: 'dohfzkmw3',
    api_key: '864173192532786',
    api_secret: 'wDMcDkoke_UkqTjnETSeYul8-kM',
    secure: true
});
const upload = multer(); // no { storage: storage } since we are not using disk storage


// for your server to correctly return the "/css/main.css" file, the "static" middleware must be used:  
// in your server.js file, add the line: app.use(express.static('public')); before your "routes"
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

// The server must listen on process.env.PORT || 8080
var HTTP_PORT = process.env.PORT || 8080;

//The server must output: "Express http server listening on port" - to the console, where port is the port the server is currently listening on (ie: 8080)
function onHTTPStart() {
    console.log("Express http server listening on:" + HTTP_PORT);
}

// setup a 'route' to listen on the default url path
// The route "/" must redirect the user to the "/about" route – this can be accomplished using res.redirect()
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
    res.redirect("/blog");
});

app.get("/about", (req, res) => {
    res.render('about');
    // res.sendFile(path.join(__dirname, "views/about.html"));
})

// This route will return a JSON formatted string containing all of the posts within the posts.json file whose published property is set to true (ie: "published" posts)
app.get('/blog', async(req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    // console.log(viewData)
    res.render('blog', { data: viewData })

});

// Adding the Blog/:id Route
app.get('/blog/:id', async(req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })
});

// This route will return a JSON formatted string containing all the posts within the posts.json files
app.get("/posts", (req, res) => {

    var category = req.query.category;
    var minDate = req.query.minDate;

    if (category) {
        blog_service.getPostsByCategory(category)
            .then((data) => {
                if (data.length > 0) res.render('posts', { posts: data })
                else res.render('posts', { message: "no results" });
            })
    } else if (minDate) {
        blog_service.getPostsByMinDate(minDate)
            .then((data) => {
                if (data.length > 0) res.render('posts', { posts: data })
                else res.render('posts', { message: "no results" });
            })
    } else {
        blog_service.getAllPosts()
            .then((data) => {
                console.log(data)
                if (data.length > 0) res.render('posts', { posts: data })
                else res.render('posts', { message: "no results" });
            })
    }

})

app.get("/post/:value", (req, res) => {
    var id = req.params.value;
    blog_service.getPostById(id)
        .then((data) => res.send(data))
        .catch((err) => res.send(err))
})

app.get("/posts/add", (req, res) => {
    blog_service.getCategories()
        .then((data) => res.render('addPost', { categories: data }))
        .catch(() => res.render('addPost', { categories: [] }))

})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imgUrl) {
        req.body.featureImage = imgUrl;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addPost(req.body).then((data) => {

            res.redirect('/posts');
        })
    }
})

// This GET route is very similar to your current "/posts/add" route - only instead of "rendering" the "addPost" view, we will instead set up the route to "render" an "addCategory" view (added later)
app.get("/categories/add", (req, res) => {
    res.render('addCategory');
})

// This route will return a JSON formatted string containing all of the categories within the categories.json file
app.get("/categories", (req, res) => {
    blog_service.getCategories()
        .then((data) => {
            if (data.length > 0) res.render('categories', { categories: data });
            else res.render("categories", { message: "no results" });
        })

})

// This POST route is very similar to the logic inside the "processPost()" function within your current "/post/add" POST route - only instead of calling the addPost() blog-service function, you will instead call your newly created addCategory() function with the POST data in req.body (NOTE: there's also no "featureImage" property that needs to be set)  
// Instead of redirecting to /posts when the promise has resolved (using .then()), we will instead redirect to /categories
app.post("/categories/add", (req, res) => {

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imgUrl) {
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog_service.addCategory(req.body).then((data) => {
            res.redirect('/categories');
        })
    }
})

// This GET route will invoke your newly created deleteCategoryById(id) blog-service method.  If the function resolved successfully, redirect the user to the "/categories" view.  If the operation encountered an error, return a status code of 500 and the plain text: "Unable to Remove Category / Category not found)"
app.get("/categories/delete/:id", (req, res) => {
    var id = req.params.id;
    blog_service.deleteCategoryId(id)
        .then((data) => res.redirect('/categories'))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found)"))
})

// This GET route functions almost exactly the same as the route above, only instead of invoking deleteCategoryById(id), it will instead invoke deletePostById(id) and return an appropriate error message if the operation encountered an error
app.get("/posts/delete/:id", (req, res) => {
    var id = req.params.id;
    blog_service.deletePostId(id)
        .then((data) => res.redirect('/posts'))
        .catch(() => res.status(500).send("Unable to Remove Post / Post not found)"))
})


// If the user enters a route that is not matched with anything in your app (ie: http://localhost:8080/app) then you must return the custom message "Page Not Found" with an HTTP status code of 404.
app.get("*", function(req, res) {
    res.render('404');
    // res.sendFile(path.join(__dirname, "views/notFound.html"), 404);
})

// setup http server to listen on HTTP_PORT
blog_service.initialize().then(function() {
    app.listen(HTTP_PORT, onHTTPStart);
})

blog_service.initialize().catch(() => {
    console.log("Fail to read JSON file")
})