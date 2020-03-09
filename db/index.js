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

//SELECT QUERY
function selectQuery(table, columns = "*", conditions = null) {
  const query =
    `SELECT ${columns} FROM ${table}` +
    ` ${conditions ? `WHERE ${conditions}` : ""}`;

  return query;
}

//UPDATE QUERY

function updateQuery(table, changes, conditions) {
  const query =
    `UPDATE ${table} SET ${changes}` +
    ` ${conditions ? `WHERE ${conditions}` : ""}`;

  return query;
}

module.exports = {
  sequelize,
  dbAuthentication,
  insertQuery,
  selectQuery,
  updateQuery
};
