const express = require('express')
const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const mongoose = require('mongoose')
const User = require('./models/user')
const util = require('util')

const SteamStrategy = passportSteam.Strategy;
const port = process.env.PORT || 3000

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    // returnURL: 'https://gbaoe2-test.herokuapp.com/',
    // realm: 'https://gbaoe2-test.herokuapp.com/',
    returnURL: 'http://localhost:' + port + '/api/auth/steam/return',
    realm: 'http://localhost:' + port + '/',
    apiKey: 'BBE9946D7BFD4BA31BBD0F168E2F4E71'
}, function (identifier, profile, done) {
    process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
    });
    }
));

const app = express()

// configure express to look for views in public
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(session({
    secret: 'adfjnsdkgjsdksdg',
    name: 'name of session id',
    resave: false,
    saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
    res.redirect('/')
});

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
    res.redirect('/')
});

app.listen(port)

// connect to MongoDB
const dbURI = 'mongodb+srv://sebnaylor:tufnell123@gbaoe2.egedr.mongodb.net/gbaoe2?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    // .then((result) => app.listen(port))
    .catch((err) => console.log(err))

app.get('/', (req, res) => {
    console.log("req.user in app.get '/'", req.user)
    res.render('dashboard', { user:req.user})
    // uncomment this & paste /api/auth/steam after localhost:3000 to log onto steam and see the JSON response
    // res.send(req.user)
})

app.get('/profile', (req, res) => {
    res.render('profile', { 
        title: 'Profile',
        user:req.user 
    })
})

app.get('/about', (req, res) => {
    console.log("req.user from app.get'/'", req.user)
    res.render('about', { 
        title: 'About',
        user:req.user
    })
})

app.use((req, res) => {
    res.status(404).render('404')
})

