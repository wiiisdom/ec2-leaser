const AWS = require('aws-sdk');

exports.list = function (res, next, backend) {
  var ec2 = new AWS.EC2(
    backend.content
  );
  ec2.describeInstances({}, function(err, data) {
    if (err) {
      return next(err)
    } else {
      var vms = data.Reservations.map(function(element) {
        var vm = {}
        var awsinstance = element.Instances[0]
        vm.id = awsinstance.InstanceId
        vm.awsType = awsinstance.InstanceType
        vm.launch = awsinstance.LaunchTime
        vm.dns = awsinstance.PublicDnsName
        vm.state = awsinstance.State.Name
        awsinstance.Tags.forEach(function(element) {
          vm[element.Key.toLowerCase()] = element.Value
        })
        return vm
      });
      // console.log(vms);
      res.send(vms);
    }
  });
};
