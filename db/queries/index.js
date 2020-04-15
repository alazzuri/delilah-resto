// DATABASE
const { dbName } = require("../sequelize");

// SCHEMA QUERY
function createDbQuery() {
  return `CREATE SCHEMA IF NOT EXISTS ${dbName} `;
}

// USERS TABLE QUERY
function usersTableQuery() {
  return `CREATE TABLE IF NOT EXISTS ${dbName}.users (
        user_id int unsigned NOT NULL AUTO_INCREMENT,
        username varchar(45) NOT NULL,
        password varchar(45) NOT NULL,
        firstname varchar(45) NOT NULL,
        lastname varchar(45) NOT NULL,
        address varchar(45) NOT NULL,
        email varchar(45) NOT NULL,
        phone_number varchar(45) NOT NULL,
        is_admin tinyint unsigned NOT NULL,
        PRIMARY KEY (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

// PRODUCTS TABLE QUERY
function productsTableQuery() {
  return `CREATE TABLE IF NOT EXISTS ${dbName}.products (
        product_id int unsigned NOT NULL AUTO_INCREMENT,
        product_name varchar(45) NOT NULL,
        product_price int unsigned NOT NULL,
        product_photo varchar(500) NOT NULL,
        PRIMARY KEY (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

// ORDERS TABLE QUERY
function ordersTableQuery() {
  return `CREATE TABLE IF NOT EXISTS ${dbName}.orders (
        order_id int unsigned NOT NULL AUTO_INCREMENT,
        order_status enum('new','confirmed','preparing','delivering','delivered') NOT NULL DEFAULT 'new',
        order_time time NOT NULL,
        order_description varchar(45) NOT NULL,
        order_amount int unsigned NOT NULL,
        payment_method enum('cash','credit') NOT NULL,
        user_id int unsigned NOT NULL,
        PRIMARY KEY (order_id),
        KEY user_id_idx (user_id),
        CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

// ORDER RELATIONSHIP TABLE QUERY
function ordersRelationshipTableQuery() {
  return `CREATE TABLE IF NOT EXISTS ${dbName}.orders_products (
        relationship_id int unsigned NOT NULL AUTO_INCREMENT,
        order_id int unsigned NOT NULL,
        product_id int unsigned NOT NULL,
        product_quantity int unsigned NOT NULL,
        PRIMARY KEY (relationship_id),
        KEY order_id_idx (order_id),
        KEY product_id_idx (product_id),
        CONSTRAINT order_id FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
        CONSTRAINT product_id FOREIGN KEY (product_id) REFERENCES products (product_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

function useQuery() {
  const query = "USE " + dbName;
  return query;
}

//INSERT QUERY
function insertQuery(table, properties, values) {
  const dataToInsert = values.map((value) => `'${value}'`).join(",");
  const query = `INSERT INTO ${dbName}.${table} (${properties}) VALUES (${dataToInsert})`;
  return query;
}

//SELECT QUERY
function selectQuery(table, columns = "*", conditions = null) {
  const query =
    `SELECT ${columns} FROM ${dbName}.${table}` +
    ` ${conditions ? `WHERE ${conditions}` : ""}`;

  return query;
}

//UPDATE QUERY
function updateQuery(table, changes, conditions) {
  const query =
    `UPDATE ${dbName}.${table} SET ${changes}` + `WHERE ${conditions}`;
  return query;
}

//DELETE QUERY
function deleteQuery(table, conditions) {
  const query = `DELETE FROM ${dbName}.${table} WHERE ${conditions}`;
  return query;
}

//JOIN QUERY
function joinQuery(mainTable, columns, joiners, conditions) {
  const fullJoiners = joiners
    .map((element) => `JOIN ${dbName}.${element} `)
    .toString()
    .replace(/,/g, "");
  const query =
    `SELECT ${columns} FROM ${dbName}.${mainTable}` +
    ` ${fullJoiners}` +
    `${conditions ? `WHERE ${conditions}` : ""}`;
  return query;
}

module.exports = {
  createDbQuery,
  deleteQuery,
  insertQuery,
  joinQuery,
  ordersRelationshipTableQuery,
  ordersTableQuery,
  productsTableQuery,
  selectQuery,
  updateQuery,
  useQuery,
  usersTableQuery,
};
