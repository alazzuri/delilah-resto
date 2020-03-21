const {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  updateQuery
} = require("./queries");

const { sequelize } = require("./sequelize");

module.exports = {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  updateQuery,
  sequelize
};
