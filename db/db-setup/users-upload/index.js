const fs = require("fs");
const csv = require("csv-parser");
const getStream = require("get-stream");
const { insertQuery } = require("../../queries");
const { sequelize } = require("../../sequelize");

const usersData = async () => {
  const parseStream = csv({ delimiter: "," });
  const data = await getStream.array(
    fs.createReadStream("../datasets/users/users.csv").pipe(parseStream)
  );
  return data;
};

let usersUpload = async data => {
  const dataToUpload = await usersData();
  for (let i = 0; i < dataToUpload.length; i++) {
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
      } = dataToUpload[i];
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
      await sequelize.query(query, { raw: true });
    } catch (err) {
      throw new Error(err);
    }
  }
};

module.exports = { usersUpload };
