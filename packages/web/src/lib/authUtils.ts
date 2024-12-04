import { Session } from "sst/node/auth";
import { headers } from "next/headers";

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}

export const checkSession = () => {
  const authorization = headers().get("Authorization");
  // remove Bearer from token
  const token = authorization?.split(" ")[1];

  if (!token) {
    throw new Error("No token");
  }

  const session = Session.verify(token);

  // Check user is authenticated
  if (session.type !== "user") {
    throw new Error("Not authenticated");
  }
  return session;
};
