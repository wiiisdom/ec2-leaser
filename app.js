var express = require('express');
var path = require('path');
// var passport = require('passport');
// const auth = require('./services/auth.service');
var cors = require('cors');
require('dotenv').config()

// mongo express
var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./mongo_express_config')

// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://localhost/test';
let mongoDB = process.env.MONGO_URL || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express()

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token'],
};
app.use(cors(corsOption));

app.use(express.json());
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

// auth(passport);
// app.use(passport.initialize());
// app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
app.use('/', indexRouter);

// mongo express
app.use('/mongo', mongo_express(mongo_express_config))

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

module.exports = app;
