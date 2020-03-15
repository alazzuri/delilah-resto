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
  updateQuery,
  deleteQuery,
  joinQuery
} = require("./db");

//CONEXION BASE DE DATOS

const dataBase = async () => {
  return await dbAuthentication();
};

async function nada() {
  const query = "SELECT * FROM delilah_resto.users";
  const [resultados] = await sequelize.query(query, { raw: true });
  // console.log(resultados);
} /// esto eliminar, era una prueba. CORREGIR LAS FUNCIONES SACANDO EL .THEN PARA QUE QUEDEN CON ESTE FORMARO

nada();
//SET UP SERVER
server.listen(3000, () => {
  dataBase();
  console.log("Server Started");
});

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
  createdOrder
    ? res.status(201).json(createdOrder)
    : res.status(405).json("Invalid Input"); // ver el status code y cambiar en la DOC de la API
});

server.put(
  "/v1/orders/:orderId",
  validateAuth,
  updateOrderStatus,
  (req, res) => {
    const { updatedOrder } = req;
    updatedOrder
      ? res.status(202).json(updatedOrder) //Actualizar msj en la DOC de la API. Ver todos los status code
      : res.status(405).json("Invalid status suplied"); // ver el status code y cambiar en la DOC de la API
  }
);

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
      "idusers, username, password, isAdmin",
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

async function deleteProduct(req, res, next) {
  const id = +req.params.productId;
  const productToDelete = await findProductById(id);
  if (productToDelete) {
    const isDeleted = await dataBase().then(async () => {
      const query = deleteQuery("products", `idproducts = ${id}`);
      await sequelize.query(query, { raw: true });
      return true;
    });

    req.isDeleted = isDeleted;
  } else {
    res.status(404).json("Product not found");
  }
  next();
}

async function createOrder(req, res, next) {
  const { user, products, payment_method } = req.body;
  const addedOrder = await addOrderInDb(user, products, payment_method);
  if (addedOrder) {
    req.createdOrder = addedOrder;
  } else {
    req.createdOrder = false;
  }
  next();
}

async function addOrderInDb(user, products, payment_method) {
  const userData = await findUserbyUsername(user);
  const userId = userData.idusers;
  const orderTime = new Date().toLocaleTimeString(); /// ver como se pasa a formato base de datos
  const [orderDesc, totalPrice] = await obtainOrderDescAndPrice(products);
  const addedOrder = await createOrderRegistry(
    orderTime,
    orderDesc,
    totalPrice,
    payment_method,
    userId
  );
  addedRelationship = await createOrderRelationship(addedOrder, products);
  if (addedRelationship) {
    const orderInfo = await printOrderInfo(addedOrder);
    return orderInfo;
  } else {
    console.error(err);
  }
}

async function obtainOrderDescAndPrice(products) {
  let orderDescription = "";
  let subtotal = 0;
  for (let i = 0; i < products.length; i++) {
    orderDescription = orderDescription + (await printDescName(products[i]));
    subtotal = +subtotal + +(await findProductPrice(products[i]));
  }
  return [orderDescription, subtotal];
}

async function printDescName(product) {
  const { productId, quantity } = product;
  const productName = (await findProductById(productId)).product_name;
  const productDesc = `${quantity}x${productName.slice(0, 5)} `;
  return productDesc;
}

async function findProductPrice(product) {
  const { productId, quantity } = product;
  const productPrice = (await findProductById(productId)).product_price;
  const subtotal = `${+productPrice * +quantity}`;
  return subtotal;
}

async function createOrderRegistry(
  orderTime,
  orderDescription,
  totalPrice,
  paymentMethod,
  user
) {
  const query = insertQuery(
    "orders",
    "order_time, order_description, order_amount, payment_method, id_user",
    [orderTime, orderDescription, totalPrice, paymentMethod, user]
  );

  const [addedRegistry] = await sequelize.query(query, { raw: true });
  return addedRegistry;
}

async function createOrderRelationship(orderId, products) {
  products.forEach(async product => {
    const { productId, quantity } = product;
    const query = insertQuery(
      "orders_products",
      "order_id, product_id, quantity",
      [orderId, productId, quantity]
    );
    await sequelize.query(query, { raw: true });
  });
  return true;
}

async function printOrderInfo(orderId) {
  const ordersQuery = joinQuery(
    "orders",
    "orders.*, users.username, users.firstname, users.lastname,users.address, users.email, users.phone_number",
    ["users ON orders.id_user = users.idusers"],
    `idorders = ${orderId}`
  );

  const [orderInfo] = await sequelize.query(ordersQuery, { raw: true });

  const completeDesc = async () => {
    const order = orderInfo[0];
    const productsQuery = joinQuery(
      "orders_products",
      "orders_products.quantity, products.*",
      [`products ON orders_products.product_id = products.idproducts`],
      `order_id = ${order.idorders}`
    );
    const [productsInfo] = await sequelize.query(productsQuery, {
      raw: true
    });
    order.products = await productsInfo;
    return order;
  };

  return completeDesc();
}

async function listOrders(req, res, next) {
  const ordersQuery = selectQuery("orders", "idorders");
  const [ordersIds] = await sequelize.query(ordersQuery, { raw: true });
  const detailedOrders = async () => {
    return Promise.all(
      ordersIds.map(async order => printOrderInfo(order.idorders))
    );
  };
  req.ordersList = await detailedOrders();
  next();
}

// listOrders();
// function findOrder(orderDb, id) {
//   const foundOrder = orderDb.find(order => +order.id === +id);
//   return foundOrder;
// }

async function updateOrderStatus(req, res, next) {
  const id = +req.params.orderId;
  const { status } = req.body; // unificar nombres de constantes

  const orderToUpdate = await findOrderbyId(id);

  if (orderToUpdate) {
    const query = updateQuery(
      "orders",
      `status = '${status}'`,
      `idorders = ${id}`
    );
    await sequelize.query(query, { raw: true });
    req.updatedOrder = await findOrderbyId(id);
  } else {
    res.status(404).json("Order not found");
  }
  next();
}

async function findOrderbyId(orderId) {
  const existingOrder = async () => {
    const query = selectQuery("orders", "*", `idorders = ${orderId}`);
    const [dbOrder] = await sequelize.query(query, { raw: true });
    const foundOrder = await dbOrder.find(
      element => element.idorders === orderId
    );
    return foundOrder;
  };

  return existingOrder();
}

// ERROR DETECTION
server.use((err, req, res, next) => {
  if (!err) return next();
  console.log("An error has occurred", err);
  res.status(500).send("Error");
});
