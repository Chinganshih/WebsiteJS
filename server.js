/*********************************************************************************
 *  WEB322 – Assignment 2
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 * 
 *  Name: __chinganshih________ Student ID: __148221195__ Date: ___2022-05-31___
 *
 *  Heroku Web App URL: ___https://boiling-falls-99685.herokuapp.com_____
 *
 *  GitHub Repository URL: __https://github.com/Chinganshih/web322-app.git____
 *
 ********************************************************************************/

var blog_service = require("./blog-service.js");
var path = require("path");
var express = require("express");
var app = express();


var HTTP_PORT = process.env.PORT || 8080;

function onHTTPStart() {
    console.log("Express http server listening on:" + HTTP_PORT);
}

// app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
    res.redirect("/about");
});

app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "views/about.html"));
})

app.get("/blog", function(req, res) {
    blog_service.getPublishedPosts().then((data) => {
        res.send(data);
    })
    blog_service.getPublishedPosts().catch((err) => {
        var message = err;
        res.send(message);
    })

})

app.get("/posts", function(req, res) {
    blog_service.getAllPosts().then((data) => {
        res.send(data);
    })
    blog_service.getAllPosts().catch((err) => {
        var message = err;
        res.send(message);
    })

})

app.get("/categories", function(req, res) {
    blog_service.getCategories().then((data) => {
        res.send(data);
    })
    blog_service.getCategories().catch((err) => {
        var message = err;
        res.send(message);
    })
})

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