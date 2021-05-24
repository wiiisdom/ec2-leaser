var AWS = require("aws-sdk");

const fs = require("fs");

const REGION = "us-east-1";
const BACKEND_ID = "5bee2f8fa038cc00cec86132";
const ec2 = new AWS.EC2({ region: REGION });

let rawdata = fs.readFileSync("images.json");
let images = JSON.parse(rawdata);

images.map(async (image) => {
  if (BACKEND_ID === image.backend.$oid && image.name !== "sapbi422-win") {
    console.log(`Name: ${image.name}`);
    delete image.content.MaxCount;
    delete image.content.MinCount;
    image.content.SecurityGroups = image.content.SecurityGroupIds;
    delete image.content.SecurityGroupIds;
    const params = {
      LaunchTemplateData: image.content,
      LaunchTemplateName: image.name.replace(/[^a-zA-Z0-9]+/g, "-"),
      VersionDescription: image.description,
      TagSpecifications: [
        {
          ResourceType: "launch-template",
          Tags: [
            {
              Key: "Ec2Leaser",
              Value: "true",
            },
          ],
        },
      ],
    };
    try {
      const result = await ec2.createLaunchTemplate(params).promise();
    } catch (err) {
      console.error(err);
    }
  }
});
