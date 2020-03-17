const { JWT, signature } = require("../../auth");
const { findUserbyUsername } = require("../users");

async function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  try {
    const registeredUser = await findUserbyUsername(username);
    if (registeredUser) {
      const { password: dbPassword, is_admin } = registeredUser;
      if (password === dbPassword) {
        const token = JWT.sign({ username, is_admin }, signature);
        req.jwtToken = token;
        next();
      } else {
        res.status(400).json("Wrong password");
      }
    } else {
      res.status(400).json("Invalid Username");
    }
  } catch (err) {
    next(new Error(err));
  }
}

function validateAuth(req, res, next) {
  const token = req.headers.authorization;
  const validatedUser = JWT.verify(token, signature);
  const { is_admin } = validatedUser;
  if (is_admin) {
    req.is_admin = is_admin;
    next();
  } else {
    res.status(403).json("Forbidden");
  }
}

module.exports = { validateCredentials, validateAuth };
