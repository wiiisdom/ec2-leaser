const AWS = require('aws-sdk');

exports.list = function (res, next, backend) {
  var ec2 = new AWS.EC2(
    backend.content
  );
  var params = {
    Filters: [
       {
      Name: "instance-state-name",
      Values: [
         "pending",
         "running",
         "shutting-down",
         "stopping",
         "stopped"
      ]
     }
    ]
   };
  ec2.describeInstances(params, function(err, data) {
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
  if(instance.image.backend == null) {
    return next("No backend on image");
  }
  var ec2 = new AWS.EC2(
    instance.image.backend.content
  );
  if(instance.image.content == null) {
    return next("No content on image");
  }
  if(instance.image.content.TagSpecifications == null) {
    return next("No tags on image");
  }
  // put the name and description in the template
  instance.image.content.TagSpecifications.forEach((item) => {
    item.Tags.push({
      Key: "Name",
      Value: "TEMP_" + instance.image.name + "_" + instance.name
    })
    item.Tags.push({
      Key: "description",
      Value: instance.image.description + " @ " + instance.description
    })
  })

  ec2.runInstances(instance.image.content, function(err,data) {
    if (err) return next(err);
    res.send('Image started successfully')
  });
};