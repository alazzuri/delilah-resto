const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");
const { JWT, signature } = require("./auth");
const {
  sequelize,
  dbAuthentication,
  insertQuery,
  selectQuery,
  updateQuery
} = require("./db");

//CONEXION BASE DE DATOS

const dataBase = async () => await dbAuthentication;

dataBase().then(async () => {
  const query = "SELECT * FROM delilah_resto.users";
  const [resultados] = await sequelize.query(query, { raw: true });
  // console.log(resultados);
});

//SET UP SERVER
server.listen(3000, () => console.log("Server Started"));

server.use(bodyParser.json(), CORS());

// USERS ENDPOINTS
server.post("/v1/users/", validateExistingUser, registerUser, (req, res) => {
  const { isCreated } = req;
  isCreated
    ? res.status(201).json("User Created")
    : res.status(400).json("Missing Arguments");
});

server.post("/v1/users/login", validateCredentials, (req, res) => {
  const { jwtToken } = req;
  jwtToken !== null
    ? res.status(200).json(jwtToken) // ver de mandar en el HEADER la validez del TOken
    : res.status(400).json("Invalid username or password supplied");
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

server.delete("/v1/products/", validateAuth, deleteProduct, (req, res) => {
  //traer listado de productos de la DB)
  const { isDeleted } = req;
  isDeleted && res.status(200).json("Deleted"); //Actualizar msj en la DOC de la API. Ver todos los status code
});

// ORDERS ENDPOINTS

server.get("/v1/orders/", validateAuth, (req, res) => {
  res.status(200).json({ productsDB: "Database" }); // remplazar por el listado de la DB.
});

server.post("/v1/orders/", createOrder, (req, res) => {
  const { isCreated } = req;
  isCreated
    ? res.status(201).json("Order Created")
    : res.status(405).json("Invalid Input"); // ver el status code y cambiar en la DOC de la API
});

server.put("/v1/orders/", validateAuth, updateOrderStatus, (req, res) => {
  //traer listado de productos de la DB)
  const { isUpdated } = req;
  isUpdated
    ? res.status(202).json("Order Udpated") //Actualizar msj en la DOC de la API. Ver todos los status code
    : res.status(405).json("Invalid status suplied"); // ver el status code y cambiar en la DOC de la API
});

// UTILS

async function findUserByName(req) {
  const { firstname, lastname } = req.body;

  const userExists = await dataBase().then(async () => {
    const query = selectQuery(
      "users",
      "firstname, lastname",
      `firstname = '${firstname}' AND lastname = '${lastname}'`
    );

    const [dbUser] = await sequelize.query(query, { raw: true });
    const existingUser = await dbUser.find(
      element =>
        element.firstname === firstname && element.lastname === lastname
    );

    return existingUser ? true : false;
  });
  return userExists;
}

async function validateExistingUser(req, res, next) {
  const existingUser = await findUserByName(req);
  !existingUser ? next() : res.status(409).json("User already exists");
}

function registerUser(req, res, next) {
  const {
    username,
    password,
    firstname,
    lastname,
    address,
    email,
    phone_number,
    isAdmin
  } = req.body;
  if (
    username &&
    password &&
    firstname &&
    lastname &&
    address &&
    email &&
    phone_number
  ) {
    dataBase()
      .then(async () => {
        const query = insertQuery(
          "users",
          "username, password, firstname, lastname, address, email, phone_number, isAdmin",
          [
            username,
            password,
            firstname,
            lastname,
            address,
            email,
            phone_number,
            isAdmin
          ]
        );
        await sequelize.query(query, { raw: true });
        return true;
      })
      .then(response => {
        req.isCreated = response;
        next();
      });
  } else {
    req.isCreated = false;
    next();
  }
}

async function findUserbyUsername(username) {
  const existingUser = await dataBase().then(async () => {
    const query = selectQuery(
      "users",
      "username, password, isAdmin",
      `username = '${username}'`
    );

    const [dbUser] = await sequelize.query(query, { raw: true });
    const foundUser = await dbUser.find(
      element => element.username === username
    );
    return foundUser;
  });

  return existingUser;
}

async function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  const registeredUser = await findUserbyUsername(username);
  if (registeredUser) {
    const dbUsername = registeredUser.username;
    const dbPassword = registeredUser.password;
    const isAdmin = registeredUser.isAdmin;

    if (username === dbUsername && password === dbPassword) {
      const token = JWT.sign({ username, isAdmin }, signature);
      req.jwtToken = token;
    } else {
      req.jwtToken = null;
    }
  } else {
    req.jwtToken = null;
  }
  next();
}

function validateAuth(req, res, next) {
  const token = req.headers.authorization;
  const validatedUser = JWT.verify(token, signature);
  const { isAdmin } = validatedUser;
  if (isAdmin) {
    req.isAdmin = isAdmin;
    next();
  } else {
    res.status(403).json("Forbidden");
  }
}

async function getProducts(req, res, next) {
  const productsList = await dataBase().then(async () => {
    const query = selectQuery("products");
    const [dbProducts] = await sequelize.query(query, { raw: true });
    return dbProducts;
  });

  return productsList;
}

async function createProduct(req, res, next) {
  const { name, photoUrls, price, status } = req.body;
  if (name && photoUrls && price >= 0) {
    const createdProduct = await newProduct(name, photoUrls, price);
    req.addedProduct = createdProduct;
  } else {
    req.addedProduct = null;
  }
  next();
}

async function newProduct(product_name, product_photo, product_price) {
  return dataBase().then(async () => {
    const query = insertQuery(
      "products",
      "product_name, product_photo, product_price",
      [product_name, product_photo, product_price]
    );
    const [addedProduct] = await sequelize.query(query, { raw: true });
    return addedProduct;
  });
}

async function findProductById(id) {
  const existingProduct = await dataBase().then(async () => {
    const query = selectQuery("products", "*", `idproducts = ${id}`);

    const [dbProduct] = await sequelize.query(query, { raw: true });

    const foundProduct = await dbProduct.find(
      element => element.idproducts === id
    );
    return foundProduct;
  });

  return existingProduct;
}

async function applyProductChanges(productToUpdate, updatedProperties) {
  const currentProduct = productToUpdate;
  const newProperties = updatedProperties;
  const updatedProduct = Object.assign(currentProduct, newProperties);
  return updatedProduct;
}

async function updateProductInDb(id, product) {
  const { product_name, product_photo, product_price } = product;
  updatedProduct = await dataBase().then(async () => {
    const query = updateQuery(
      "products",
      `product_name = '${product_name}', product_photo = '${product_photo}', product_price = '${product_price}'`,
      `idProducts = ${id}`
    );
    await sequelize.query(query, { raw: true });
    const dbProduct = await findProductById(id);
    return dbProduct;
  });
  return updatedProduct;
}

async function updateProduct(req, res, next) {
  const id = +req.params.productId;
  const updatedProperties = req.body;
  const productToUpdate = await findProductById(id);
  if (productToUpdate) {
    const updatedProduct = await applyProductChanges(
      productToUpdate,
      updatedProperties
    );
    const savedProduct = await updateProductInDb(id, updatedProduct);
    req.updatedProduct = savedProduct;
  } else {
    res.status(404).json("Product not found");
  }
  next();
}

function deleteProduct(req, res, next) {
  const { id } = req.body;
  //traer producto de la base de datos por su id y reemplazar por este. Ver si no hace falta pedir el ID aca.
  const PRODUCTS = [{ id: 1 }];
  const productToDelete = findProductById(PRODUCTS, id);

  if (productToDelete) {
    // borrar producto
    req.isDeleted = true;
  } else {
    res.status(404).json("Product not found");
  }
  //logica de mandar a la base de datos
  next();
}

function createOrder(req, res, next) {
  const { user, products } = req.body;
  if (user && products) {
    //logica de mandar a la base de datos
    req.isCreated = true;
  } else {
    req.isCreated = false;
  }
  next();
}

function findOrder(orderDb, id) {
  const foundOrder = orderDb.find(order => +order.id === +id);
  return foundOrder;
}

function updateOrderStatus(req, res, next) {
  const { orderId, status } = req.body; // unificar nombres de constantes
  //traer producto de la base de datos por su id y reemplazar por este. Ver si no hace falta pedir el ID aca.
  const ORDERS = [{ id: 1 }];
  const orderToUpdate = findOrder(ORDERS, orderId);

  if (orderToUpdate) {
    if (status) {
      req.isUpdated = true;
      //logica de mandar a la base de datos
    } else {
      req.isUpdated = false;
    }
  } else {
    res.status(404).json("Product not found");
  }
  next();
}

// ERROR DETECTION
server.use((err, req, res, next) => {
  if (!err) return next();
  console.log("An error has occurred", err);
  res.status(500).send("Error");
});
