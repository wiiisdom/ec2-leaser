# vmlist

[![Build Status](https://travis-ci.org/gbandsmith/vmlist.svg?branch=master)](https://travis-ci.org/gbandsmith/vmlist)

A tool to list and manage virtual machines all around the company. Will manage this kind of backends :

* AWS EC2
* VMWare (VSphere)
* Xen ([custom WS](https://github.com/gbandsmith/xenrestapi))


## How to run the tool locally ?

This is a React frontend application (in ``client/``) with a NodeJS/Express backend.

### Install global packages

```
$ npm install -g concurrently nodemon
```

### Launch the application
```
$ npm install
$ npm run both # launch both back and front
$ npm run client # launch front
$ npm run server # launch back
```

### Test REST API

```
# list images
http :5000/api/image

# start instance
http :5000/api/image/start id=5c6392d6d9d37f1e398def9e name=bla description=bli

# list backend
http :5000/api/backend

```

And then check on http://localhost:3000 for the frontend. The backend is on http://localhost:5000.

### Generate a production build

Using [Dokku](https://github.com/dokku/dokku)

Currently I just need to push on my dokku remote :

```
git push dokku
```

## Populate Data in MongoDB

Go to http://localhost:5000/mongo (admin/pass) for the Mongo administrative interface.
It allow to CRUD backends, and images.

Go to the database test if you work on local or the database name choosen if anything else

### Add a backend

- Create the collection ``backends`` if it doesn't exist.
- For each backend create a document. Here is 3 examples for the 3 actual supported backend kind.

### AWS

```
{
    "_id": ObjectID(),
    "name": "ohio",
    "type": "aws",
    "content": {
        "region": "us-east-2",
        "secretAccessKey": "aws_secret_key",
        "accessKeyId": "aws_key_id"
    }
}
```

### VMWARE

```
{
    "_id": ObjectID(),
    "name": "my-vsphere-server",
    "type": "vmware",
    "content": {
        "host": "vsphere-host:443",
        "user": "myuser",
        "password": "mypass"
    }
}
```

### XEN

```
{
    "_id": ObjectID(),
    "name": "my-xen-server",
    "type": "xen",
    "content": {
        "url": "http://xenserverurl:3001/api"
    }
}
```

For Xen support you must setup on the Xen server the custom webservice that you can find [here](https://github.com/gbandsmith/xenrestapi)

Once a backend is added, the vmlist tool will try to grab the list of virtual machines for each backend. Take note of the *\_id* identifer for the backend created, it will be used for images.

### Add a image (AWS backend only)

Images are needed if you want to allow the creation of AWS instances from existing AWS AMI.

- Create the collection ``images`` if it doesn't exist.
- Add an image following the below example

```
{
    "_id": ObjectID(),
    "backend": ObjectID("AWS_BACKEND"),
    "name": "linux",
    "description": "Amazon Linux 2 AMI (HVM), SSD Volume Type",
    "content": {
        "ImageId": "ami-04328208f4f0cf1fe",
        "InstanceType": "t2.small",
        "KeyName": "my-key-name",
        "MaxCount": 1,
        "MinCount": 1,
        "SecurityGroupIds": [
            "ssh",
            "dev",
            "default"
        ],
        "TagSpecifications": [
            {
                "ResourceType": "instance",
                "Tags": [
                    {
                        "Key": "pool",
                        "Value": "TEMP"
                    },
                    {
                        "Key": "scheduler:ec2-startstop",
                        "Value": "none;2300;utc;all"
                    },
                    {
                        "Key": "costcenter",
                        "Value": "varied"
                    }
                ]
            }
        ]
    }
}
```

``AWS_BACKEND`` must be replaced by the *\_id* of the AWS backend linked to the AMI used. Take note that an AMI is available **only** in a specific AWS region (you can't define a AWS_BACKEND for region us-east-1 and an image besed on this backend with an AMI available in us-east-2 !)

The ``content`` key is the exact value waited by the AWS API (the function ``ec2.runInstances``).

Tags ``name`` and ``description`` will be set direcly during launch time (based on user input)


### Google authentication

We have added a auth system on top of the system to make it usable only by a specific google suite group. To use it, you must create a new project on https://console.developers.google.com,  and generate Client ID for webapplication. Then :

* create an `.env` file at the root level of the project with the following content:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
SESSION_SECRET=a-secret
```

* create under `/client` folder an `.env` file that contains:

```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
```

When you deploy your app in prod environement don't forget to define the same environment variables to make it work.

`dokku config:set myapp GOOGLE_CLIENT_ID=your-client-id`

and so...
