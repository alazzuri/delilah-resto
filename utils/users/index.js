const { sequelize, insertQuery, selectQuery } = require("../../db");

async function findUserByName(req) {
  const { firstname, lastname } = req.body;
  const userExists = async () => {
    const query = selectQuery(
      "users",
      "firstname, lastname",
      `firstname = '${firstname}' AND lastname = '${lastname}'`
    );
    const [dbUser] = await sequelize.query(query, { raw: true });
    const existingUser = await dbUser.find(
      element =>
        element.firstname === firstname && element.lastname === lastname
    );

    return existingUser ? true : false;
  };
  return await userExists();
}

async function validateExistingUser(req, res, next) {
  try {
    const existingUser = await findUserByName(req);
    if (!existingUser) {
      const dbUsers = await findUserbyUsername(req.body.username);
      if (!dbUsers) {
        next();
      } else {
        res.status(409).json("Username already in use");
      }
    } else {
      res.status(409).json("User already exists");
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function registerUser(req, res, next) {
  const {
    username,
    password,
    firstname,
    lastname,
    address,
    email,
    phone_number,
    is_admin
  } = req.body;
  if (
    username &&
    password &&
    firstname &&
    lastname &&
    address &&
    email &&
    phone_number
  ) {
    try {
      const query = insertQuery(
        "users",
        "username, password, firstname, lastname, address, email, phone_number, is_admin",
        [
          username,
          password,
          firstname,
          lastname,
          address,
          email,
          phone_number,
          is_admin
        ]
      );
      [userId] = await sequelize.query(query, { raw: true });
      req.createdUserId = userId;
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(400).json("Missing Arguments");
  }
}

async function findUserbyUsername(username) {
  const existingUser = async () => {
    const query = selectQuery(
      "users",
      "user_id, username, password, is_admin",
      `username = '${username}'`
    );
    const [dbUser] = await sequelize.query(query, { raw: true });
    const foundUser = dbUser[0];
    return foundUser;
  };

  return existingUser();
}

module.exports = {
  findUserByName,
  findUserbyUsername,
  registerUser,
  validateExistingUser
};
