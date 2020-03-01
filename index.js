const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");
const JWT = require("jsonwebtoken");

///ESTO SE REEEMPLAZA POR BASE DE DATOS
const signature = "vamosRiverPlate";

/////

server.listen(3000, () => console.log("Server Started"));

server.use(bodyParser.json(), CORS());

// USERS ENDPOINTS
server.post("/v1/users/", registerUser, (req, res) => {
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
server.get("/v1/products/", (req, res) => {
  //traer listado de productos de la DB)
  res.status(200).json({ productsDB: "Database" }); // remplazar por el listado de la DB.
});

// UTILS
function registerUser(req, res, next) {
  const { userName, name, password, email, address, phone } = req.body;
  if (userName && name && password && email && address && phone) {
    req.isCreated = true;
  } else {
    req.isCreated = false;
  }
  next();
  //logica de la base de datos
}

function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  // traer username y contraseña de la DB. Traer tambien si es admin
  const dbUsername = "Ale";
  const dbPassword = "123";
  const isAdmin = true;
  if (username === dbUsername && password === dbPassword) {
    const token = JWT.sign({ username, isAdmin }, signature); // traer signature
    req.jwtToken = token;
  } else {
    req.jwtToken = null;
  }
  next();
}
