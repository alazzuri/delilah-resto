//LIBS
const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");

//UTILS
const {
  registerUser,
  validateExistingUser,
  validateCredentials,
  validateAuth,
  getProducts,
  getUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
} = require("../utils");

//SET UP SERVER
server.listen(3000, () => {
  console.log("Server Started");
});

server.use(bodyParser.json(), CORS());

// USERS ENDPOINTS
server.get("/v1/users/", validateAuth, getUsers, (req, res) => {
  const { usersList } = req;
  res.status(200).json(usersList);
});

server.post("/v1/users/", validateExistingUser, registerUser, (req, res) => {
  const { createdUserId } = req;
  res.status(201).json({ userId: createdUserId });
});

server.post("/v1/users/login", validateCredentials, (req, res) => {
  const { jwtToken } = req;
  const loginResponse = { token: jwtToken };
  res.status(200).json(loginResponse);
});

// PRODUCTS ENDOPINTS
server.get("/v1/products/", getProducts, (req, res) => {
  const { productList } = req;
  res.status(200).json(productList);
});

server.post("/v1/products/", validateAuth, createProduct, (req, res) => {
  const { addedProduct } = req;
  res.status(201).json(addedProduct);
});

server.put(
  "/v1/products/:productId",
  validateAuth,
  updateProduct,
  (req, res) => {
    const { updatedProduct } = req;
    res.status(202).json(updatedProduct);
  }
);

server.delete(
  "/v1/products/:productId",
  validateAuth,
  deleteProduct,
  (req, res) => {
    const { isDeleted } = req;
    isDeleted && res.status(200).json("Deleted");
  }
);

// ORDERS ENDPOINTS
server.get("/v1/orders/", validateAuth, listOrders, (req, res) => {
  const { ordersList } = req;
  res.status(200).json(ordersList);
});

server.post("/v1/orders/", createOrder, (req, res) => {
  const { createdOrder } = req;
  res.status(201).json(createdOrder);
});

server.put(
  "/v1/orders/:orderId",
  validateAuth,
  updateOrderStatus,
  (req, res) => {
    const { updatedOrder } = req;
    res.status(202).json(updatedOrder);
  }
);

server.delete("/v1/orders/:orderId", validateAuth, deleteOrder, (req, res) => {
  const { isDeleted } = req;
  isDeleted && res.status(200).json("Deleted");
});

// ERROR DETECTION
server.use((err, req, res, next) => {
  if (!err) return next();
  console.log("An error has occurred", err);
  res.status(500).send("Error");
});
