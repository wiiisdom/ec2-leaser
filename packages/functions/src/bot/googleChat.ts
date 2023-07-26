import { ApiHandler } from 'sst/node/api';
import { chat_v1 } from 'googleapis';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { snapshotInstance } from './ec2/snapshot';
import { restoreInstance } from './ec2/restore';
import { checkBearerToken } from './google/auth';

const SNAPSHOT_COMMAND = 1;
const RESTORE_COMMAND = 2;

export const handler = ApiHandler(async _evt => {
  // First check the google token provided in headers. It fails if the call is not coming from Google and this specific PROJECT_ID
  await checkBearerToken(_evt);

  if (_evt.body === undefined) {
    throw new Error('Body undefined');
  }

  // Read the body
  const googleChatEvent = JSON.parse(_evt.body) as chat_v1.Schema$DeprecatedEvent;
  try {
    // Extract the instance id from the message text
    const instanceId = extractInstanceId(googleChatEvent.message?.text);

    // Based on the slash command run specific actions
    switch (getSlashCommand(googleChatEvent)) {
      case SNAPSHOT_COMMAND:
        if (instanceId !== null) {
          await snapshotInstance(instanceId);
          return buildMessage(
            `Instance *${instanceId}* is being saved! Please wait ~ 20mn before restoring it. You can follow it on AWS Console (EC2 > Snapshots > Search for your instanceId).`
          );
        } else {
          return buildMessage(
            "I can't see an instanceId. Please use this command with: `/snapshot i-xxxxx`"
          );
        }
      case RESTORE_COMMAND:
        if (instanceId !== null) {
          await restoreInstance(instanceId);
          return buildMessage(
            `Instance *${instanceId}* is being restored! The root volume replacement task might take a while (~ 20mn). You can follow it on AWS Console (EC2 > Instances > Choose your instance > Storage).`
          );
        } else {
          return buildMessage(
            "I can't see an instanceId. Please use this command with: `/restore i-xxxxx`"
          );
        }
      default:
        return buildMessage('I can help you. Use a / command 🤖');
    }
  } catch (e) {
    return buildMessage(
      `Oupsie! There is an issue:
\`${e}\`
Contact email:lab@wiiisdom.com if appropriate.`
    );
  }
});

const buildMessage = (text: string): APIGatewayProxyStructuredResultV2 => {
  return {
    statusCode: 200,
    body: JSON.stringify({ text }),
  };
};

export const getSlashCommand = (event: chat_v1.Schema$DeprecatedEvent) => {
  const slashCommand = event?.message?.annotations?.[0]?.slashCommand?.commandId;
  return slashCommand ? Number(slashCommand) : null;
};

const instanceIdRegex = /(i-[a-f0-9]{8}(?:[a-f0-9]{9})?)/;

export const extractInstanceId = (text: string | undefined | null) => {
  if (!text) {
    return null;
  }
  const regex = instanceIdRegex.exec(text);
  return regex ? regex[0] : null;
};
