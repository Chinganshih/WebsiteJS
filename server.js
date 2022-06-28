/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: _ChingAn, Shih_ Student ID: _148221195_ Date: __2022-06-28__
 *
 *  Online (Heroku) URL:  https://damp-depths-30191.herokuapp.com/
 *
 *  GitHub Repository URL: __ https://github.com/Chinganshih/web322-app.git____
 *
 ********************************************************************************/


var blog_service = require("./blog-service.js");
var path = require("path");
var express = require("express");
var app = express();

// Inside your server.js file "require" the libraries
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphs = require('express-handlebars');

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
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.render('about');
    // res.sendFile(path.join(__dirname, "views/about.html"));
})

// This route will return a JSON formatted string containing all of the posts within the posts.json file whose published property is set to true (ie: "published" posts)
app.get("/blog", (req, res) => {
    blog_service.getPublishedPosts()
        .then((data) => { res.send(data); })
        .catch((err) => {
            var message = err;
            res.send(message);
        })

})

// This route will return a JSON formatted string containing all the posts within the posts.json files
app.get("/posts", (req, res) => {

    var category = req.query.category;
    var minDate = req.query.minDate;

    if (category) {
        blog_service.getPostsByCategory(category)
            .then((data) => { res.render('posts', { posts: data }) })
            .catch((err) => { res.render("posts", { message: "no results" }) })

    } else if (minDate) {
        blog_service.getPostsByMinDate(minDate)
            .then((data) => { res.render('posts', { posts: data }) })
            .catch((err) => { res.render("posts", { message: "no results" }) })
    } else {
        blog_service.getAllPosts()
            .then((data) => { res.render('posts', { posts: data }) })
            .catch((err) => {
                // var message = err;
                res.render("posts", { message: "no results" })
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
    res.render('addPost');
    // res.sendFile(path.join(__dirname, "/views/addPost.html"));
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


// This route will return a JSON formatted string containing all of the categories within the categories.json file
app.get("/categories", (req, res) => {
    blog_service.getCategories()
        .then((data) => { res.render("categories", { categories: data }); })
        .catch((err) => {
            // var message = err;
            res.render("categories", { message: "no results" });
        })
})

// If the user enters a route that is not matched with anything in your app (ie: http://localhost:8080/app) then you must return the custom message "Page Not Found" with an HTTP status code of 404.
app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "views/notFound.html"), 404);
})

// setup http server to listen on HTTP_PORT
blog_service.initialize().then(function() {
    app.listen(HTTP_PORT, onHTTPStart);
})

blog_service.initialize().catch(() => {
    console.log("Fail to read JSON file")
})