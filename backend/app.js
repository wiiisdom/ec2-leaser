const serverless = require("serverless-http");
var express = require("express");
var path = require("path");
var cors = require("cors");

var app = express();

var corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"],
};
app.use(cors(corsOption));

app.use(express.json());
// app.use(require("morgan")("combined"));
// app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
// app.use(
//   require("express-session")({
//     secret: process.env.SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// static routes
var indexRouter = require("./routes/index");
app.use("/", indexRouter);

module.exports.handler = serverless(app);
