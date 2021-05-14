const aws = require("../services/aws.service");

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const IMAGE_TABLE = "vmlistImagesTable";
const BACKEND_TABLE = "vmlistBackendsTable";

exports.list = async (req, res, next) => {
  const params = {
    TableName: BACKEND_TABLE,
  };
  try {
    const data = await dynamoDb.scan(params).promise();
    console.log(data.Items);
    const backends = data.Items;

    const images_promises = backends.map((backend) => {
      const promise = new Promise(async (resolve, reject) => {
        const params = {
          TableName: IMAGE_TABLE,
        };
        const launchTemplates = await aws.listLaunchTemplates(backend);
        delete backend.content;
        backend.launchTemplates = launchTemplates;
        resolve(backend);
      });
      return promise;
    });

    const images = await Promise.all(images_promises);
    res.send(images);
  } catch (error) {
    return next(error);
  }
};

exports.start = function (req, res, next) {
  res.send("toto");
  // Image.findById({ _id: req.body.image }, "+content")
  //   .populate("backend", "+content")
  //   .exec((err, image) => {
  //     var instance = {
  //       image: image,
  //       name: req.body.name,
  //       description: req.body.description,
  //     };
  //     aws.start(res, next, instance, req.user.email);
  //   });
};
