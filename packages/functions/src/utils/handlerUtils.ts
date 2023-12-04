import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ApiHandler } from 'sst/node/api';
import { checkSession } from './authUtils';

/**
 * This handler is helping to be sure that the user is correctly
 * authenticated.
 * @param cb
 * @returns
 */
export const SecureHandler = (
  cb: (
    evt: APIGatewayProxyEventV2,
    ctx: Context
  ) => Promise<void | APIGatewayProxyStructuredResultV2>
) =>
  ApiHandler(async (evt, ctx) => {
    checkSession();
    return cb(evt, ctx);
  });
