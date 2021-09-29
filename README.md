# ec2-leaser

A tiny tool to allow google user to start EC2 instances from a list of Launch Template already created. It can be used to not provide `startInstance` IAM right yo your users.

## Architecture

The backend is managed serverlessly via [SST](https://docs.serverless-stack.com/).
The frontend is a React application. It's design to be deployed on AWS.

## How to run the application locally ?

Run the backend only (you need only that to use a local frontend):

```
cd backend/
yarn sst start backend-stack
```

Start the frontend:

```
cd frontend/
yarn start
```

no need to provide environment variables, are these are made available to the frontend via the @serverless-stack/static-site-env package.

## How to deploy the application

Deploy the infrastructure with SST (front and back stack)
(it push the frontend to S3 and invalidate cloudfront distribution)

```
cd backend/
yarn sst deploy --stage dev
yarn sst deploy --stage prod --region eu-central-1
```

### Google authentication

We have added a auth system on top of the system to make it usable only by a specific google suite group. To use it, you must create a new project on https://console.developers.google.com, and generate Client ID for webapplication.

### Cost center data content

To add cost center list so that the frontend can make use of it, add items directly from the AWS GUI:
visit [DynamoDB section](https://console.aws.amazon.com/dynamodbv2/home)
search for `{stage}-ec2-leaser-cost-center-list`
grab data in backend/data
add items (needs to be done 1 by 1)
