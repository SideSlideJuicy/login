const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/user.js'); // Import the User model from user.js
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Set the views directory

mongoose.connect('mongodb://localhost:27017/Login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Route to render the login.ejs page
app.get('/login', (req, res) => {
    res.render('login'); // Render signup.ejs from the "views" directory
});

// Route to render the signup.ejs page
app.get('/signup', (req, res) => {
    res.render('signup'); // Render signup.ejs from the "views" directory
});

// Route to render the forgot.ejs page
app.get('/forgot', (req, res) => {
    res.render('forgot'); // Render signup.ejs from the "views" directory
});

app.get('/get-users', async (req, res) => {
    try {
      const users = await User.find(); // Use the User model
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

// Passport Local Strategy for Authentication
passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return done(err);
        if (res === false) return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
      });
    });
  }));

passport.serializeUser((user, done) => {
done(null, user.id);
});

passport.deserializeUser((id, done) => {
User.findById(id, (err, user) => {
    done(err, user);
});
});

// Routes for Sign-In and Register
app.get('/login', (req, res) => {
res.send('Login Page');
});

app.post('/login', passport.authenticate('local', {
successRedirect: '/dashboard',
failureRedirect: '/login',
}));




// Add user data
app.post('/signup', async (req, res) => {
    try {
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
      });
      const savedUser = await newUser.save();
    }
    
    catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });














app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});
