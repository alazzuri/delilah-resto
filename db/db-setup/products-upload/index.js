const fs = require("fs");
const csv = require("csv-parser");
const getStream = require("get-stream");
const { insertQuery } = require("../../queries");
const { sequelize } = require("../../sequelize");

const productsData = async () => {
  const parseStream = csv({ delimiter: "," });
  const data = await getStream.array(
    fs.createReadStream("../datasets/products/products.csv").pipe(parseStream)
  );
  return data;
};

let productsUpload = async data => {
  const dataToUpload = await productsData();
  for (let i = 0; i < dataToUpload.length; i++) {
    try {
      const { product_name, product_price, product_photo } = dataToUpload[i];
      const query = insertQuery(
        "products",
        "product_name, product_price, product_photo",
        [product_name, product_price, product_photo]
      );
      await sequelize.query(query, { raw: true });
    } catch (err) {
      throw new Error(err);
    }
  }
};

module.exports = { productsUpload };
