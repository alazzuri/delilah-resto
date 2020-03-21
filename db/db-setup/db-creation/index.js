// DATABASE
const { sequelize } = require("../../sequelize");
const {
  createDbQuery,
  ordersRelationshipTableQuery,
  ordersTableQuery,
  productsTableQuery,
  usersTableQuery
} = require("../../queries");

const creator = async (...queries) => {
  for (let i = 0; i < queries.length; i++) {
    await sequelize.query(queries[i](), { raw: true });
  }
};

const createDb = async () =>
  creator(
    createDbQuery,
    usersTableQuery,
    productsTableQuery,
    ordersTableQuery,
    ordersRelationshipTableQuery
  );

module.exports = { createDb };
