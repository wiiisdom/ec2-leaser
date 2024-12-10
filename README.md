# ec2-leaser

A tiny tool to allow google user to start EC2 instances from a list of Launch Template already created. It can be used to not provide `startInstance` IAM right yo your users.

![EC2 Leaser](ec2-leaser.gif)

It's also possible to snapshot and restore instances!

## Architecture

It's a fullstack application (NextJs) deployed via [SST](https://sst.dev/) on AWS.

## How to run the application locally ?

Run the backend if you want to work with the cron job

```
pnpm install
pnpm dev
```

Run NextJs if you want to work with the app

```
pnpm install
cd packages/web/
pnpm dev
```

## How to deploy the application

Deploy the infrastructure with SST (front and back stack)
(it push the frontend to S3 and invalidate cloudfront distribution)

```
AWS_REGION=eu-central-1 pnpm sst deploy --stage prod # on aws prod account
AWS_REGION=us-east-1 pnpm sst deploy --stage demo # on aws demo account

```

### Cost center data content

To add cost center list so that the frontend can make use of it, add items directly from the AWS GUI:
visit [DynamoDB section](https://console.aws.amazon.com/dynamodbv2/home)
search for `{stage}-ec2-leaser-config`

See below for an example on how to enter the items in the table:

| PK          | SK                   | description                                           |
| ----------- | -------------------- | ----------------------------------------------------- |
| costcenters | eng:360Eyes          | Usage for Engineering 360Eyes                         |
| costcenters | eng:360WP            | Usage for Engineering 360WebPlatform                  |
| costcenters | eng:lab              | Generic Lab usage                                     |
| schedules   | lille-office-stop    | Stop automatically the instance at 7pm (CET timezone) |
| schedules   | montreal-office-stop | Stop automatically the instance at 7pm (EST timezone) |
