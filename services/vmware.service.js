var connect = require('vsphere-connect')

statusVmWareToVmList = function (status) {
  var text
  switch(status) {
    case "poweredOn":
      return "running"
      break
    case "poweredOff":
      return "stopped"
      break
    default:
      return status
    }
}

exports.list = function (res, next, backend) {
  var content = backend.content
  connect.createClient({
      host: content.host,
      username: content.user,
      password: content.password,
      ignoreSSL: true,
      autoLogin: true
  })
  .then(function(client) {
      return client.retrieve({
          type: 'VirtualMachine',
          //id: ['vm-47428'],
          properties: ['config.template', 'config.annotation', 'id',
          'name', 'runtime.powerState', 'runtime.bootTime',
          'summary.config.numCpu', 'summary.config.memorySizeMB',
          'summary.guest', 'guest.net']
      })
      .then(function(results) {
        var vms = results
           .filter(function(element) {
             return element.config.template === false
           })
          .map(function(element) {
          var vm = {}
          vm.id = element.id
          vm.name = element.name
          vm.description = element.config.annotation
          vm.launch = element.runtime.bootTime
          vm.state = statusVmWareToVmList(element.runtime.powerState)
          vm.ram = element.summary.config.memorySizeMB
          vm.vcpu = element.summary.config.numCpu
          vm.dns = element.summary.guest.hostName
          vm.ip = element.summary.guest.ipAddress
          if(element.guest.net[0] !== undefined) {
            vm.pool = element.guest.net[0].network
          }

          return vm
        })
          res.send(vms)
      });
  })
  .caught(function(err) {
    console.log(err)
    res.status(500).send(err.message)
  });

};
