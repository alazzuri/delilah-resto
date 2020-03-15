const {
  findUserByName,
  findUserbyUsername,
  registerUser,
  validateExistingUser
} = require("./users");

const { validateCredentials, validateAuth } = require("./auth");

const {
  getProducts,
  createProduct,
  newProduct,
  findProductById,
  applyProductChanges,
  updateProductInDb,
  updateProduct,
  deleteProduct
} = require("./products");

const {
  createOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
} = require("./orders");

module.exports = {
  findUserByName,
  findUserbyUsername,
  registerUser,
  validateExistingUser,
  validateCredentials,
  validateAuth,
  getProducts,
  createProduct,
  newProduct,
  findProductById,
  applyProductChanges,
  updateProductInDb,
  updateProduct,
  deleteProduct,
  createOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
};
