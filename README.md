# **DELILAH RESTÓ**. ![cocktail_img](/assets/icons/couscous.png)

**An API to manage your own restaurant.**

The proyect consist on a Rest API, which allows user to manage a list of users, products and orders from a restaurant.
The API allows connection with a MySQL database to store and manage the Resto's data.

Features:

- Users' register and login.
- Role Validation (Admin or not)
- Products' CRUD functions
- Orders' CRUD functions

## OPEN API Specifications

- [Open API Docs](/spec.yml)

## Getting started

### Clone the REPO:

```
$ git clone https://github.com/alazzuri/delilah-resto.git
```

or you just can download it from Github

### Installing dependencies:

```
$ npm install
```

or

```
$ yarn install
```

### Database Set up:

- Run a MySQL server

- Open `config.js` file (`db/sequelize/config.js`) where you can edit:

  1. Database's port to which the API should connect
  2. Database's name.
  3. Database's password to connect.

- Auto set up:

```
$ cd db/db-setup
$ cd node index.js
```

This will create the DB's schema, tables and will import example data of users and products. You can **edit** example information by replacing `products.csv` and/or `users.csv` files in `db/datasets`

You can also create the schemas and the tables mannualy, by using the _queries_ existing in `dbCreators.sql`.

## Run the API

```
$ cd /server
$ cd node index.js
```

## Dependencies used

- body-parser version 1.19.0.
- cors version 2.8.5.
- csv-parser version 2.3.2.
- express version 4.17.1.
- jsonwebtoken version 8.5.1.
- mysql2 version 2.1.0.
- sequelize version 5.21.5.
