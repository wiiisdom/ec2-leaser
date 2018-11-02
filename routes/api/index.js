var router = require('express').Router();
var loki = require('lokijs');

var db = new loki('loki.json', {autoupdate: true})
var backend = db.addCollection('backend')

// add a backend via a POST query
router.post('/backend/add', function(req, res, next) {
  console.log(req.body);
  backend.insert(req.body);
  res.send('hello');

});

// delete a backend via a DELETE query
router.delete('/backend/:backend', function(req, res, next) {
  console.log(res);
});

// list backends via a GET query
router.get('/backend', function(req, res, next) {
  res.send(backend.find());
});

module.exports = router;