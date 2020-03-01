const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const CORS = require("cors");

server.listen(3000, () => console.log("Server Started"));

server.use(bodyParser.json(), CORS());
