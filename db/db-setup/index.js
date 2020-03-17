const {
  createDbQuery,
  usersTableQuery,
  productsTableQuery,
  ordersTableQuery,
  ordersRelationshipTableQuery
} = require("../queries");

const { sequelize } = require("../sequelize");
const { dbName } = require("../sequelize/config");

const createDb = async (...queries) => {
  for (let i = 0; i < queries.length; i++) {
    await sequelize.query(queries[i](), { raw: true });
  }
};

(async () => {
  await createDb(
    createDbQuery,
    usersTableQuery,
    productsTableQuery,
    ordersTableQuery,
    ordersRelationshipTableQuery
  );
  console.log(`Database ${dbName} created`);
})();
