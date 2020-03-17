const dbPort = "3306";
const dbName = "delilah_resto";
const password = "delilah2020";

const dbPath = `mysql://root:${password}@localhost:${dbPort}/`;

module.exports = { dbName, dbPath };
