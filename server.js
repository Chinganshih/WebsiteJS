/*********************************************************************************
 *  WEB322 – Assignment 1
 *  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 * 
 *  Name: __chinganshih________ Student ID: __148221195__ Date: ___2022-05-13___
 *
 *  Heroku Web App URL: ___https://boiling-falls-99685.herokuapp.com_____
 *
 *  GitHub Repository URL: __https://github.com/Chinganshih/web322-app.git____
 *
 ********************************************************************************/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.send("Chinganshih, 148221195");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);