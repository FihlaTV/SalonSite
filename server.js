// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var cookieParser = require("cookie-parser");
var methodOverride = require("method-override");
var session = require("express-session");
var passport = require("passport");
var localStrategy = require("passport-local");
let path = require("path");
//let config = require("./config.js");
let funct = require("./public/assets/javascript/functions.js");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8181;

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Stuff for Passport
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({
  secret: 'supernova',
  saveUninitiatialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  console.log("Serializing: ", user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("Deserializing: ", obj);
  done(null, obj);
})

// Use the LocalStrategy within Passport to login/"signin" users.
passport.use('local-signin', new localStrategy(
  { passReqToCallback: true }, // allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function(user) {
      if (user) {
        console.log("Logged in as: ", user.username);
        req.session.success = "You are successfully logged in as " + user.username + ".";
        done(null, user);
      }

      if (!user) {
        console.log("Could not log in");
        req.session.error = "Could not log user in.  Please try again.";
        done(null, user);
      }
    })
    .fail(function(err) {
      console.log("Error: ", err.body);
    });
  }
));

// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new localStrategy(
  { passReqToCallback: true },
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function(user) {
      if (user) {
        console.log("Registered as ", user.username);
        req.session.success = "You are successfully registered and logged in as " + user.username + ".";
        done(null, user);
      }

      if (!user) {
        console.log("Could not register.");
        req.session.error = "That username is already in use.  Please try a different one.";
        done(null, user);
      }
    })
    .fail(function(err) {
      console.log("Error: ", err.body);
    });
  }
));

// Session-persisted message middleware
app.use(function(req, res, next) {
  let err = req.session.error;
  let msg = req.session.notice;
  let success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// Set Handlebars.
var exphbs = require("express-handlebars");

let jsPhoneRE = /^(\d{3})(\d{3})(\d{4})$/;

let stripStringNumbers = (input) => {
    let numRE = /\D/g;

    // Test to see if there are any non-numeric characters in the input
    return numRE.test(input) ? input : input.replace(numRE, "");
}

app.engine("handlebars", exphbs({ 
  defaultLayout: "main",
  /*helpers: {
    formatPhone: function (input) {
      let theNumber = stripStringNumbers(input);

      if (theNumber.length < 10) return "Invalid U.S. phone number";

      let s2 = ("" + theNumber).replace(/\D/g, '');
      let m = s2.match(jsPhoneRE);

      return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    }
  }*/
}));
app.set("view engine", "handlebars");

// Static directory
app.use(express.static("public"));

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Routes
// =============================================================
// Import routes and give the server access to them.
var salon = require("./controllers/salon_controller")
var customer = require("./controllers/customer_controller")
var admin = require("./controllers/admin_controller")

app.use("/", salon);
app.use("/customer", customer);
app.use("/admin", admin);

// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync(
  //{ force: true }
).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});