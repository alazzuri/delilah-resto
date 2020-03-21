const {
  sequelize,
  insertQuery,
  selectQuery,
  updateQuery,
  deleteQuery
} = require("../../db");

async function getProducts(req, res, next) {
  try {
    req.productList = await productsList();
    next();
  } catch (err) {
    next(new Error(err));
  }
}

async function productsList() {
  const query = selectQuery("products");
  const [dbProducts] = await sequelize.query(query, { raw: true });
  return dbProducts;
}

async function createProduct(req, res, next) {
  const { product_name, product_photo, product_price } = req.body;
  if (product_name && product_photo && product_price >= 0) {
    try {
      const createdProduct = await newProduct(
        product_name,
        product_photo,
        product_price
      );
      req.addedProduct = { productId: await createdProduct() };
      next();
    } catch (err) {
      next(new Error(err));
    }
  } else {
    res.status(400).json("Missing Arguments");
  }
}

async function newProduct(product_name, product_photo, product_price) {
  return async () => {
    const query = insertQuery(
      "products",
      "product_name, product_photo, product_price",
      [product_name, product_photo, product_price]
    );
    const [addedProduct] = await sequelize.query(query, { raw: true });
    return addedProduct;
  };
}

async function findProductById(id) {
  const existingProduct = async () => {
    const query = selectQuery("products", "*", `product_id = ${id}`);

    const [dbProduct] = await sequelize.query(query, { raw: true });

    const foundProduct = await dbProduct.find(
      element => element.product_id === id
    );
    return foundProduct;
  };

  return await existingProduct();
}

async function applyProductChanges(productToUpdate, updatedProperties) {
  const properties = Object.keys(updatedProperties).filter(
    property =>
      updatedProperties[property] &&
      updatedProperties[property] !== " " &&
      updatedProperties[property] !== "null" &&
      updatedProperties[property] !== "undefined" &&
      !updatedProperties[property].toString().includes("  ")
  );
  newProperties = properties.reduce((obj, property) => {
    obj[property] = updatedProperties[property];
    return obj;
  }, {});
  const updatedProduct = { ...productToUpdate, ...newProperties };
  return updatedProduct;
}

async function updateProductInDb(id, product) {
  const { product_name, product_photo, product_price } = product;
  updatedProduct = async () => {
    const query = updateQuery(
      "products",
      `product_name = '${product_name}', product_photo = '${product_photo}', product_price = '${product_price}'`,
      `product_id = ${id}`
    );
    await sequelize.query(query, { raw: true });
    const dbProduct = await findProductById(id);
    return dbProduct;
  };
  return await updatedProduct();
}

async function updateProduct(req, res, next) {
  const id = +req.params.productId;
  const updatedProperties = req.body;
  try {
    const productToUpdate = await findProductById(id);
    if (productToUpdate) {
      const updatedProduct = await applyProductChanges(
        productToUpdate,
        updatedProperties
      );
      const savedProduct = await updateProductInDb(id, updatedProduct);
      req.updatedProduct = savedProduct;
      next();
    } else {
      res.status(404).json("Product not found");
    }
  } catch (err) {
    next(new Error(err));
  }
}

async function existingOrderWithProduct(productId) {
  const query = selectQuery(
    "orders_products",
    "*",
    `product_id = ${productId}`
  );
  const [results] = await sequelize.query(query, { raw: true });

  if (results.length) {
    return true;
  } else {
    return false;
  }
}

async function deleteProduct(req, res, next) {
  const id = +req.params.productId;
  try {
    const productToDelete = await findProductById(id);
    if (productToDelete) {
      const existingOrder = await existingOrderWithProduct(id);
      if (!existingOrder) {
      const isDeleted = async () => {
        const query = deleteQuery("products", `product_id = ${id}`);
        await sequelize.query(query, { raw: true });
        return true;
      };
      req.isDeleted = await isDeleted();
      next();
    } else {
        res
          .status(409)
          .json(
            "Product linked to an active order. Please resolve conflict and try again"
          );
      }
    } else {
      res.status(404).json("Product not found");
    }
  } catch (err) {
    next(new Error(err));
  }
}

module.exports = {
  getProducts,
  createProduct,
  newProduct,
  findProductById,
  applyProductChanges,
  updateProductInDb,
  updateProduct,
  deleteProduct
};
