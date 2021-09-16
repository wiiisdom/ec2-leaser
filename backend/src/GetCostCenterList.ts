import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const start: APIGatewayProxyHandlerV2 = async () => {
  const constCenterList = {
    eng: "Generic Engineering usage",
    "eng:360wp": "Usage for Engineering 360WebPlatform",
    "eng:360eyes": "Usage for Engineering 360Eyes",
    "eng:cockpit": "Usage for Engineering Cockpit project",
    "eng:lab": "Usage for Engineering Lab team",
    "eng:wopbi": "Usage for Wiiisdom Ops for Power BI project",
    "eng:kinesis": "Usage for Engineering Kinesis-CI Project",
    "presales:360": "Resources used for presales on 360products",
    "presales:kinesis": "Resources used for presales on Kinesis-CI",
    it: "Usage for general IT resources",
    support: "Usage for Support Team",
  };
  try {
    // await fetchConstCenterList()
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(constCenterList),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(error),
    };
  }
};
