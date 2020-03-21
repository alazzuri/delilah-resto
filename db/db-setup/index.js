// DATABASE
const { createDb } = require("./db-creation");
const { dbName } = require("../sequelize");
const { productsUpload } = require("./products-upload");
const { usersUpload } = require("./users-upload");

(async () => {
  try {
    await createDb();
    await usersUpload();
    await productsUpload();
    console.log(`Database ${dbName} created.\nSetup completed. `);
  } catch (err) {
    throw new Error(err);
  }
})();
