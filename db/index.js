const {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  updateQuery,
  useQuery,
} = require("./queries");

const { sequelize } = require("./sequelize");

module.exports = {
  deleteQuery,
  insertQuery,
  joinQuery,
  selectQuery,
  updateQuery,
  useQuery,
  sequelize,
};
