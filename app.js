var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");

mongoose.connect("mongodb://localhost/auth_demo_app");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
    //secret can be anything, used to decode and encode info about the session
    secret: "I love coding!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//for the local strategy, use User.authenticate that was created in the User model
passport.use(new localStrategy(User.authenticate()));

//decode and encode info, added these functions in the plugin of the User model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(4006, () => {
    console.log("Server is running on port 4006");
});

app.get("/", (req, res) => {
    res.render("home");
});


//middleware
function isLoggedIn(req, res, next){
     
    if(req.isAuthenticated()){
         return next();
     }

     res.redirect("/login");
};


app.get("/secret", isLoggedIn, (req, res) => {
    res.render("secret");
});

//Auth Routes

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    //User.register creates new user with this username, and then hashes the password and stores it in the DB
    User.register(new User({username: req.body.username}), 
                   req.body.password, (err, user) => {

                    if(err){
                        console.log(err);
                        return res.render("register");
                    }
                    
                    //logs the user in, stores hashed password, and 'salt' wich helps unhash it
                    passport.authenticate("local")( req, res, function(){
                      res.redirect("/secret");
                    });
                 });

});

//LOGIN routes

app.get("/login", (req, res) => {
    res.render("login");
});

//added authenticate middleware, passport automatically takes the body username and pw and compares them to DB
app.post("/login",passport.authenticate("local", {

    successRedirect: "/secret",
    failureRedirect: "/login" 

}), (req, res) => {

});

//LOGOUT routes
app.get("/logout", (req, res) => {
    //passport destroys user info in the session
    req.logout();
    res.redirect("/");
});



