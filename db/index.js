const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "mysql://root:delilah2020@localhost:3306/delilah_resto" ///Acordarse de borrar esto
);

//INSERT QUERY
function insertQuery(table, properties, values) {
  const dataToInsert = values.map(value => `'${value}'`).join(",");
  const query = `INSERT INTO ${table} (${properties}) VALUES (${dataToInsert})`;
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
    ` ${conditions ? `WHERE ${conditions}` : ""}`; // PENSAR SI CONVIENE DEJAR ESTA VALIDACION O QUE SI O SI HAYA PARAMETRO

  return query;
}

//DELETE QUERY
function deleteQuery(table, conditions) {
  const query = `DELETE FROM ${table} WHERE ${conditions}`;
  return query;
}

//JOIN QUERY
function joinQuery(mainTable, columns, joiners, conditions) {
  const fullJoiners = joiners
    .map(element => `JOIN ${element} `)
    .toString()
    .replace(/,/g, "");

  const query =
    `SELECT ${columns} FROM ${mainTable}` +
    ` ${fullJoiners}` +
    `${conditions ? `WHERE ${conditions}` : ""}`;
  return query;
}

module.exports = {
  sequelize,
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery,
  joinQuery
};
