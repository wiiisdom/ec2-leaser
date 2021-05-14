var passport = require("passport");
var GoogleTokenStrategy = require("passport-google-token").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const USER_TABLE = "vmlistUsersTable";

module.exports = () => {
  // google strategy is used to validate the login
  passport.use(
    new GoogleTokenStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      async (accessToken, refreshToken, profile, done) => {
        // create or update User model with the user received via Google.
        // always accept them because the Google auth is restricted to the cpy.
        const params = {
          TableName: USER_TABLE,
          Key: {
            id: profile.id,
          },
        };
        var user;
        try {
          // get the user
          user = await dynamoDb.get(params).promise();
          if (!user.Item) {
            // create it if not existing yet
            const timestamp = new Date().getTime();
            const params = {
              TableName: USER_TABLE,
              Item: {
                id: profile.id,
                email: profile._json.email,
                name: profile.displayName,
                picture: profile._json.picture,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
            };
            user = await dynamoDb.put(params).promise();
          }
        } catch (error) {
          return done(error, null);
        }
        return done(null, user.Item);
      }
    )
  );

  // the JWT is used to auth on endpoint (after the login)
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SESSION_SECRET,
      },
      async (jwtPayload, cb) => {
        // find the user in User model related to the JWT.

        const params = {
          TableName: USER_TABLE,
          Key: {
            id: jwtPayload.id,
          },
        };

        try {
          const user = await dynamoDb.get(params).promise();
          return cb(null, user.Item);
        } catch (error) {
          return cb(error);
        }
      }
    )
  );
};
