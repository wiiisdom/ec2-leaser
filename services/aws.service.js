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

exports.start = function (res, next, instance) {
  var ec2 = new AWS.EC2(
    instance.image.backend.content
  );

   var params = {
    ImageId: instance.image.id,
    InstanceType: instance.image.type,
    KeyName: "gbandsmith",
    MaxCount: 1,
    MinCount: 1,
    SecurityGroupIds: instance.image.securityGroups,
    TagSpecifications: [
       {
      ResourceType: "instance",
      Tags: [
         {Key: "Name", Value: "TEMP_"+instance.image.name+"_"+instance.name},
         {Key: "pool", Value: "TEMP"},
         {Key: "description", Value: instance.description},
         {Key: "scheduler:ec2-startstop", Value: "none;2300;utc;all"},
         {Key: "costcenter", Value: "varied"},

      ]
     }
    ]
   };
  ec2.runInstances(params, function(err,data) {
    if (err) return next(err);
    res.send('Image started successfully')
  });
};