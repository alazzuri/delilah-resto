// LIBS
const csv = require("csv-parser");
const fs = require("fs");
const getStream = require("get-stream");

//DATABASE
const { insertQuery, sequelize } = require("../../../db");

//DATASETS
const usersDs = "../datasets/users/users.csv";

const usersData = async () => {
  const parseStream = csv({ delimiter: "," });
  const data = await getStream.array(
    fs.createReadStream(usersDs).pipe(parseStream)
  );
  return data;
};

const usersUpload = async () => {
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
