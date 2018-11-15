var request = require('request');

exports.list = function (res, next, backend) {
  request(backend.content.url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    
    var xen = JSON.parse(body);
   // console.log(xen);

   var vms = xen.map(function(element) {
    return element
  });

  res.send(vms);
  });
  
};
