const {
  findUserByName,
  findUserByUsername,
  getUsers,
  registerUser,
  validateExistingUser
} = require("./users");

const { validateAuth, validateCredentials } = require("./auth");

const {
  applyProductChanges,
  createProduct,
  deleteProduct,
  findProductById,
  findProductPrice,
  getProducts,
  newProduct,
  updateProduct,
  updateProductInDb
} = require("./products");

const {
  completeDesc,
  createOrder,
  deleteOrder,
  listOrders,
  updateOrderStatus
} = require("./orders");

module.exports = {
  applyProductChanges,
  createOrder,
  createProduct,
  completeDesc,
  deleteProduct,
  deleteOrder,
  findProductById,
  findProductPrice,
  findUserByName,
  findUserByUsername,
  getProducts,
  getUsers,
  listOrders,
  newProduct,
  registerUser,
  updateOrderStatus,
  updateProduct,
  updateProductInDb,
  validateAuth,
  validateCredentials,
  validateExistingUser
};
