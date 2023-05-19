import { Config } from "sst/node/config";
import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { Ec2ToolError } from "../../errors";

export const checkBearerToken = async (_evt: APIGatewayProxyEventV2) => {
  const auth = _evt.headers["authorization"];
  if (!auth) {
    throw new Ec2ToolError("Can't read bearer");
  }
  await checkBearer(auth.split(" ")[1]);
};

const checkBearer = async (token: string) => {
  const jwksClient = new JwksClient({
    jwksUri:
      "https://www.googleapis.com/service_accounts/v1/jwk/chat@system.gserviceaccount.com",
    cache: true
  });

  await new Promise<boolean>((resolve, reject) => {
    const getKey = (header: any, callback: any) => {
      jwksClient.getSigningKey(header.kid, (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
      });
    };

    jwt.verify(
      token,
      getKey,
      {
        audience: Config.PROJECT_ID,
        issuer: "chat@system.gserviceaccount.com"
      },
      (err: any, decoded: any) => {
        if (err) {
          reject(new Error("Bad auth"));
        } else {
          resolve(true);
        }
      }
    );
  });
};
