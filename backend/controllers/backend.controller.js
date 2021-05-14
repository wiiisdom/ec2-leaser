const aws = require("../services/aws.service");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const BACKEND_TABLE = "vmlistBackendsTable";

exports.list = async (req, res, next) => {
  const params = {
    TableName: BACKEND_TABLE,
  };
  try {
    const data = await dynamoDb.scan(params).promise();
    console.log(data.Items);
    const backends = data.Items;

    // filter to not send content field (SENSITIVE INFO !)
    res.send(
      backends.map((e) => {
        return {
          name: e.name,
          type: e.type,
        };
      })
    );
  } catch (error) {
    return next(error);
  }
};

exports.show = async (req, res, next) => {
  const params = {
    TableName: BACKEND_TABLE,
    Key: {
      name: req.params.backend,
    },
  };
  try {
    const data = await dynamoDb.get(params).promise();
    const backend = data.Item;
    aws.list(res, next, backend);
  } catch (error) {
    return next(error);
  }
};
