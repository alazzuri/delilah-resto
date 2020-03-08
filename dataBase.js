const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "mysql://root:Ezequiel201089@localhost:3306/delilah_resto"
);

const dbAuthentication = sequelize.authenticate();

module.exports = { sequelize, dbAuthentication };
