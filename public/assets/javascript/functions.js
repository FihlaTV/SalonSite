let bcrypt = require('bcryptjs');
let Q = require('q');
//let config = require('./config.js'); //config file contains all tokens and other private info
let db = require("../../../models");

//used in local-signup strategy
exports.localReg = function (username, password) {
    var deferred = Q.defer();

    db.User.findOne({
        where: {
            username: username
        }
    }).then(userData => {
        if (userData !== null) {
            console.log("Duplicate username");

            deferred.resolve(false); // username exists
        } else {
            let hash = bcrypt.hashSync(password, 8);
            let user = {
                //"name": name,
                "username": username,
                "password": hash,
                //"title": title,
                //"email": email
            }

            console.log("Creating User:", username);

            db.User.create(user)
                .then(data => {
                    deferred.resolve(user);
                });
        }
    });

    return deferred.promise;
};

//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
    var deferred = Q.defer();

    db.User.findOne({
        where: {
            username: username
        }
    }).then(userData => {
        if (userData == null) {
            console.log("USERNAME NOT FOUND ", username);

            deferred.resolve(false);
        } else {
            var hash = userData.password;

            console.log("FOUND USER:", userData.username);

            if (bcrypt.compareSync(password, hash)) {
                deferred.resolve(userData);
            } else {
                console.log("AUTHENTICATION FAILED");
                deferred.resolve(false);
            }
        }
    });

    return deferred.promise;
}