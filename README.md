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

And then check on http://localhost:3000 for the frontend. The backend is on http://localhost:5000.

### Generate a production build

Using [Dokku](https://github.com/dokku/dokku)