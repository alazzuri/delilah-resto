const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");

server.listen(3000, () => console.log("Server Started"));

server.use(bodyParser.json(), CORS());

server.post("/v1/users/", registerUser, (req, res) => {
  const { isCreated } = req;
  isCreated
    ? res.status(201).json("User Created")
    : res.status(400).json("Missing Arguments");
});

function registerUser(req, res, next) {
  const { userName, name, password, email, address, phone } = req.body;
  if (userName && name && password && email && address && phone) {
    req.isCreated = true;
    next();
  } else {
    req.isCreated = false;
    next();
  }
  //logica de la base de datos
}
