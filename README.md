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

#### Auto set up:

- Run a MySQL server.

- Create the database from MySQL by using the command line or the destktop utility.

- Open `config.js` file (`db/sequelize/config.js`) where you can edit:

  1. Database's host and port to which the API should connect
  2. Database's name.
  3. Database's user and password to connect.

```
$ cd db/db-setup
$ node index.js
```

This will create the DB's schema, tables and will import example data of users and products. You can **edit** example information by replacing `products.csv` and/or `users.csv` files in `db/datasets`

#### Manual Setup:

If the Auto set up fails, you can do the following:

1. Initialize the MySQL server.
2. Create the database called **delilah_resto** from the command line or the desktop utility.
3. Create the schema and the tables, and insert the data mannually, by using the _queries_ existing in `dbCreators.sql`.

Before start using the server, don't forget to edit `config.js` file (`db/sequelize/config.js`) with:

1. Database's host and port to which the API should connect
2. Database's name.
3. Database's user and password to connect.

## Run the API

```
$ cd server
$ node index.js
```

## Dependencies used

- body-parser version 1.19.0.
- cors version 2.8.5.
- csv-parser version 2.3.2.
- express version 4.17.1.
- jsonwebtoken version 8.5.1.
- mysql2 version 2.1.0.
- sequelize version 5.21.5.
