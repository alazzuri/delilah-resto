const fs = require("fs");
const csv = require("csv-parser");
const { insertQuery } = require("../../queries");
const { sequelize } = require("../../sequelize");
let productsData = fs.createReadStream("./products.csv");
let productsUpload = productsData.pipe(csv()).on("data", async data => {
  try {
    const { product_name, product_price, product_photo } = data;
    const query = insertQuery(
      "products",
      "product_name, product_price, product_photo",
      [product_name, product_price, product_photo]
    );
    await sequelize.query(query, { raw: true });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = { productsUpload };
