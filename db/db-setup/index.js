const { dbName } = require("../sequelize/config");
const { createDb } = require("./db-creation");
const { usersUpload } = require("./users-upload");
const { productsUpload } = require("./products-upload");

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
