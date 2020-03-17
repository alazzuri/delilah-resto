const {
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery,
  joinQuery
} = require("./queries");

const { sequelize } = require("./sequelize");

module.exports = {
  sequelize,
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery,
  joinQuery
};
