const { dbName, dbPath } = require("./config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbPath);

module.exports = { dbName, sequelize };
