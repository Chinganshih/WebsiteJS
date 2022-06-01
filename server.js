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

var blog_service = require("./blog-service");
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
    res.send();
    console.log("TODO: get all posts who have published==true");
})

app.get("/posts", function(req, res) {
    res.sendFile(path.join(__dirname, "data/posts.json"));
})

app.get("/categories", function(req, res) {
    res.sendFile(path.join(__dirname, "data/categories.json"));
})

app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "views/notFound.html"), 404);
})

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHTTPStart);