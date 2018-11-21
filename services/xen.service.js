var request = require('request');

exports.list = function (res, next, backend) {
  request(backend.content.url, function (error, response, body) {
    if(error) {
      res.send({error: error})
    }
    var xen = JSON.parse(body);
    var vms = xen.map(function(element) {
      return element
    });
    res.send(vms);
  });
};