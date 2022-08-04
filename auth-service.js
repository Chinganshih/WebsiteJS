const bcrypt = require('bcryptjs');
var monogoose = require("mongoose");
var Schema = monogoose.Schema;
let User;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {

        // completed connection string to your MongoDB Atlas database 
        let db = monogoose.createConnection("mongodb+srv://chinganshih:anna23582037@senecaweb.bq4cdjt.mongodb.net/?retryWrites=true&w=majority")

        // reject the promise with the provided error
        db.on('error', (err) => {
            reject(err);
        })

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        })
    })
}

//userData = [.userName, .userAgent, .email, .password, .password2]
module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {

        //compare the value of the .password property to the .password2 property and if they do not match, 
        //reject the returned promise with the message: "Passwords do not match"
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {

            bcrypt.hash(userData.password, 10)
                .then(hash => {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else if (err.code !== 11000) {
                                reject("There was an error creating the user:" + err);
                            }
                        })
                })
                .catch((err) => reject("There was an error encrypting the password"))

        }
    })
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (!users[0]) {
                    reject("Unable to find user: " + userData.userName)
                }

                bcrypt.compare(userData.password, users[0].password)
                    .then((result) => {
                        if (result == true) {
                            users[0].loginHistory.push({
                                dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent
                            })
                            User.updateOne({ userName: userData.userName }, { $set: { loginHistory: users[0].loginHistory } })
                                .exec()
                                .then()
                                .catch((err) => { reject("There was an error verifying the user: " + err) })

                            resolve(users[0])
                        } else {
                            reject("Incorrect Password for user: " + userData.userName)
                        }
                    })

            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName)
            })
    })
}