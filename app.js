// Eziamaka Clinton 


var express = require('express'),
    handlebars = require('express-handlebars').create({defaultLayout: 'main'}),
    cookieParser = require('cookie-parser'),
    sessions = require('express-session'),
    bodyParser = require('body-parser'),
    https = require('https'),
    fs = require('fs'),
    md5 = require('md5'),
    mongoose = require('mongoose'),
    credentials = require('./credentials'),
    Users = require('./models/usermodel.js'),
    seedDB = require('./models/seed.js');

var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    //Define custom helpers here
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

var app = express();


mongoose.connect('mongobd://localhost:21011');
seedDB.seed(Users);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieSecret));
app.use(sessions({
    resave: true,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    cookie: {maxAge: 3600000},
}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

var port = app.set('port', process.env.PORT || 3100);

app.post('/changeValue', function (req, res) {
    var username = req.session.userName
    console.log({username: req.session.userName, query: req.query, body: req.body})
    if(req.session.userName == req.query.user){
        var contextObj = {
            phoneno: req.body.phoneno,
            office: req.body.office, 
        };
        Users.findOneAndUpdate({ uname: username }, contextObj, function (error) {
            if (error) console.log(error)
            res.redirect(303, '/users/' + req.query.user); 
        })
    }else{
        res.redirect(303,'/users/' + req.query.user); 
    }
});

// HELPERS
function checklogin (req, res, user, password) {
    Users.findOne({uname: user}, function(err, user) {
        if (err) {
            res.render('login',{message: 'Error accessing database. Try again'});
        } else if (user.pass == md5(password)) {
            req.session.userName = req.body.uname;
            req.session.office = user.office;
            req.session.phoneno = user.phoneno;
            res.redirect(303, 'profile-home');
        } else {
            res.render('login',{message: 'Username or password was not valid. Try again'});
        }
    });
};

// MIDDLEWARE
app.use(function (req, res, next) {
    if(req.path.startsWith('/profile')){
        if (req.session.userName) {
            res.render('profile-home')
        } else {
            res.render('login',{message: 'Please login to access the second page'});
        }
    } else {
        next();
    }
});

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

//POSTERS
app.post('/processLogin', function(req, res){
    //Determine if user is registering
    if (req.body.buttonVar == 'login') {
        checklogin(req, res, req.body.uname.trim(), req.body.pword.trim())
    } else {
        res.redirect(303, 'register');
    }
});

app.post('/processReg', function(req, res){
    if (req.body.pword.trim() == req.body.pword2.trim()) {
        var newUser = Users({
            uname: req.body.uname,
            pass: md5(req.body.pword)
        });
        newUser.save(function(err) {
            if (err) {
                console.log('Error adding new user ' + err);
            }
        });
        req.session.userName = req.body.uname;
        res.redirect(303,'profile-home');
    } else {
        res.render('register',{message: 'Passwords did not match. Try again'})
    }
    Users.find(function(err, users) {
        if (err) {
            console.log('error');
        }
        console.log(users);
        console.log("length: " + users.length);
        for (var i=0; i<users.length; i++) {
            console.log(users[i].uname);
            console.log(users[i].pass);
            console.log("");
        }
    });
});



// GETTERS
app.get('/', function(req, res){
    res.render('login');
});

app.get('/profile-home', function(req, res) {
    if (req.session.userName) {
        res.render('profile-home');
    } else {
        res.render('login',{message: 'Please login to access the second page'});
    }
});

app.get('/profile-register', function(req, res) {
    res.render('register');
});

app.get('/logout', function(req, res) {
    delete req.session.userName;
    res.redirect(303,'/');
});

app.get('/users/:uname/edit', function (req, res) {
    console.log(req.session.username, req.params.uname)
    if(req.session.username == req.params.uname){
       res.render('editedUser', {uname: req.session.username}); 
    }else{
        res.redirect(303, "/users/" + req.params.uname);
    }
    
});

app.get('/users/:uname', (req, res) => {
    let username = req.params.uname;
    Users.findOne({uname: username}, function (error, user) {
        res.render("profile-home", user)
    })
});



app.listen(port);

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});


