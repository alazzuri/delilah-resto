const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");
const {
  registerUser,
  validateExistingUser,
  validateCredentials,
  validateAuth,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  listOrders,
  updateOrderStatus,
  deleteOrder
} = require("./utils");

//SET UP SERVER
server.listen(3000, () => {
  console.log("Server Started");
});

server.use(bodyParser.json(), CORS());

// USERS ENDPOINTS
server.post("/v1/users/", validateExistingUser, registerUser, (req, res) => {
  const { createdUserId } = req;
  createdUserId && res.status(201).json({ userId: createdUserId });
});

server.post("/v1/users/login", validateCredentials, (req, res) => {
  const { jwtToken } = req;
  const loginResponse = { token: jwtToken };
  jwtToken && res.status(200).json(loginResponse);
});

// PRODUCTS ENDOPINTS
server.get("/v1/products/", async (req, res) => {
  productsDb = await getProducts();
  res.status(200).json(productsDb);
});

server.post("/v1/products/", validateAuth, createProduct, (req, res) => {
  const { addedProduct } = req;

  addedProduct
    ? res.status(201).json("Product Created")
    : res.status(405).json("Invalid Input"); // ver el status code y cambiar en la DOC de la API
});

server.put(
  "/v1/products/:productId",
  validateAuth,
  updateProduct,
  (req, res) => {
    const { updatedProduct } = req;
    updatedProduct
      ? res.status(202).json(updatedProduct) //Actualizar msj en la DOC de la API. Ver todos los status code// ver si se devuelve el producto o msje de exito
      : res.status(405).json("Invalid Input"); // ver el status code y cambiar en la DOC de la API
  }
);

server.delete(
  "/v1/products/:productId",
  validateAuth,
  deleteProduct,
  (req, res) => {
    const { isDeleted } = req;
    isDeleted && res.status(200).json("Deleted"); //Actualizar msj en la DOC de la API. Ver todos los status code
  }
);

// ORDERS ENDPOINTS

server.get("/v1/orders/", validateAuth, listOrders, (req, res) => {
  const { ordersList } = req;
  res.status(200).json(ordersList);
});

server.post("/v1/orders/", createOrder, (req, res) => {
  const { createdOrder } = req;
  createdOrder && res.status(201).json(createdOrder);
});

server.put(
  "/v1/orders/:orderId",
  validateAuth,
  updateOrderStatus,
  (req, res) => {
    const { updatedOrder } = req;
    updatedOrder && res.status(202).json(updatedOrder); //Actualizar msj en la DOC de la API. Ver todos los status code
  }
);

server.delete("/v1/orders/:orderId", validateAuth, deleteOrder, (req, res) => {
  const { isDeleted } = req;
  isDeleted && res.status(200).json("Deleted"); //Actualizar msj en la DOC de la API. Ver todos los status code
});

// ERROR DETECTION
server.use((err, req, res, next) => {
  if (!err) return next();
  console.log("An error has occurred", err);
  res.status(500).send("Error");
});
