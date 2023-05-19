# ec2-leaser

A tiny tool to allow google user to start EC2 instances from a list of Launch Template already created. It can be used to not provide `startInstance` IAM right yo your users.
Another feature of the application is a small Google Chat Bot to snapshot and restore EC2 instance volumes.

## Architecture

The backend is managed serverlessly via [SST](https://sst.dev/).
The frontend is a React application. It's design to be deployed on AWS.

## How to run the application locally ?

Run the backend only (you need only that to use a local frontend):

```
yarn
yarn dev
```

Start the frontend:

```
cd packages/web/
yarn dev
```

no need to provide environment variables, are these are made available to the frontend via SST.

## How to deploy the application

Deploy the infrastructure with SST (front and back stack)
(it push the frontend to S3 and invalidate cloudfront distribution)

```
yarn deploy --stage prod --region eu-central-1 # on aws prod account
yarn deploy --stage demo --region us-east-1 # on aws demo account

```

### Google authentication

We have added a auth system on top of the system to make it usable only by a specific google suite group. To use it, you must create a new project on https://console.developers.google.com, and generate Client ID for webapplication.

### Google Chat Bot

The Google Chat Bot need to be configured also on https://console.developers.google.com. In the same `EC2 Leaser` project, it's needed to activate the `Google Chat API` and configure it correctly:

- name: `EC2 Tools`
- avatar URL: `https://developers.google.com/chat/images/quickstart-app-avatar.png`
- description: `Help you with several EC2 tooling.`
- Enable interactive features: `Yes`
- activate only `Receive 1:1 messages`
- connection settings: `App URL`
- App URL must be set to the `ChatApi` URL of the stack outputs
- Define 2 slash commands:
  - `/snapshot` with ID `1` and description `Snapshot a EC2 instance for later restore` (no check on `Open a dialog`)
  - `/restore` with ID `2` and description `Restore the snapshot of an EC2 instance` (no check on `Open a dialog`)
- Visibility: This option will allow to restrict the usage of the bot to a specific number of users defined here.

The method `checkBearerToken` is verify important because it allow us to check that the call on the public API endpoint
is made by Google, for the specific project ID. We have based our code on this [article](https://dev.to/foga/verifying-google-chat-request-in-nodejs-36i).

### Cost center data content

To add cost center list so that the frontend can make use of it, add items directly from the AWS GUI:
visit [DynamoDB section](https://console.aws.amazon.com/dynamodbv2/home)
search for `{stage}-ec2-leaser-config`

See below for an example on how to enter the items in the table.

### Cost centers list

| PK          | SK          | description                          |
| ----------- | ----------- | ------------------------------------ |
| costcenters | eng:360Eyes | Usage for Engineering 360Eyes        |
| costcenters | eng:360WP   | Usage for Engineering 360WebPlatform |
| costcenters | eng:lab     | Generic Lab usage                    |

### Schedules list

| PK        | SK                   | description                                           |
| --------- | -------------------- | ----------------------------------------------------- |
| schedules | lille-office-stop    | Stop automatically the instance at 7pm (CET timezone) |
| schedules | montreal-office-stop | Stop automatically the instance at 7pm (EST timezone) |
