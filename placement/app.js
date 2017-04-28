var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    
mongoose.connect("mongodb://localhost/plac");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

var UserSchema = mongoose.Schema({
  Name : String,
  Enrollment_no : Number,
  Year : Number
});

var StudentSchema  = mongoose.Schema({
    username : String,
    password: String,
    Year : Number,
    enrollment: Number,
    
})

var probSchema = mongoose.Schema({
   name : String,
   difficulty: String,
   questions: String,
   a: String,
   b: String,
   c: String,
   d: String,
   correctAns: String
});

StudentSchema.plugin(passportLocalMongoose);

app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));


var Student = mongoose.model("Student",StudentSchema);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

var problem = mongoose.model("problem",probSchema);

var User = mongoose.model("User", UserSchema);
app.get("/", isLoggedIn, function(req, res) {
    res.render("landing");
});
app.get("/home", isLoggedIn, function(req, res) {
    res.render("landing");
});
app.get("/placementRegis", isLoggedIn, function(req, res) {
    User.find({}, function(err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("showPlacementStudents", {student: data});
        }
    });
});
app.post("/placementRegis", isLoggedIn,   function(req,res){
       User.create(req.body.User, function(err,data){
       if (err){
           console.log(err);
       }else{
           res.redirect("/placementRegis");
       }
   }); 
});
app.get("/problems", isLoggedIn, function(req, res) {
    problem.find({},function(err,data){
        if (err){
            console.log(err);
        }else{
             res.render("problems", {data: data});
        }
    }); 
});
app.get("/problems/new", isLoggedIn,  function(req, res) {
    res.render("probnew");
});
app.post("/problems", isLoggedIn, function(req,res){
    problem.create(req.body.problem,function(err,data){
        if(err){
            console.log(err);
        }else{
            res.redirect("/problems");
        }
    });
});
app.get("/problems/:id", isLoggedIn, function(req, res) {
    problem.findById(req.params.id, function(err,data){
       if (err){
           console.log(err);
       } else{
           console.log(data);
           res.render("statements",{statements: data});
       }
    });
});


app.get("/register", function(req, res){
   res.render("register"); 
});

app.post("/register", function(req, res){
    Student.register(new Student({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        console.log(user)
        passport.authenticate("local")(req, res, function(){
           res.redirect("/");
        });
    });
});

app.get("/login",  function(req, res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
        res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("server is listening .... ");
});
// var configAuth  =  require("./confiq");

// passport.use(new FacebookStrategy({
//     clientID: configAuth.facebookauth.clientID,
//     clientSecret: configAuth.facebookauth.client,
//     callbackURL:  configAuth.facebookauth.callbackURL
    
// },

//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

// app.get('/auth/facebook', passport.authenticate('facebook'));

// app.get('/auth/facebook/callback',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });

