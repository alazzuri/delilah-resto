const fs = require("fs");
const csv = require("csv-parser");
const { insertQuery } = require("../queries");
const { sequelize } = require("../sequelize");
let userData = fs.createReadStream("./users.csv");
let usersUpload = userData.pipe(csv()).on("data", async data => {
  try {
    const {
      username,
      password,
      firstname,
      lastname,
      address,
      email,
      phone_number,
      is_admin
    } = data;
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
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = { usersUpload };
