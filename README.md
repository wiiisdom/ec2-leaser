# vmlist

A tool tolist and manage virtual machines all around the company. Will manage this kind of backends :

* AWS EC2
* VMWare (VSphere)
* Xen (custom WS)

## How to run the tool locally ?

This is a React frontend application (in ``client/``) with a NodeJS/Express backend.

### Install global packages

```
$ npm install -g concurrently nodemon
```

### Launch the application
```
$ npm install
$ npm run both (launch both back and front)
$ npm run client (launch front)
$ npm run server (launch back)
```

### Test REST API

```
# list images
http :5000/api/image

# add image
http :5000/api/image/add region=us-east-2 id=ami-05807dd4c81877220 description='SAP BOBJ 4.2.6 INT Fenix' type=t2.large

# remove image
http DELETE :5000/api/image/0

```

And then check on http://localhost:3000 for the frontend. The backend is on http://localhost:5000.

### Generate a production build

Using [Dokku](https://github.com/dokku/dokku)