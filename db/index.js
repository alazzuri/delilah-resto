const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "mysql://root:delilah2020@localhost:3306/delilah_resto" ///Acordarse de borrar esto
);

const dbAuthentication = sequelize.authenticate();

//INSERT QUERY
function insertQuery(table, properties, values) {
  const dataToInsert = values.map(value => `'${value}'`).join(",");
  const query = `INSERT INTO ${table}(${properties}) VALUES (${dataToInsert})`;
  return query;
}

module.exports = { sequelize, dbAuthentication, insertQuery };
