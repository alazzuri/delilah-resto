//AUTH
const { JWT, signature } = require("../../auth");

// UTILS
const { findUserByUsername } = require("../users");

function validateAuth(req, res, next) {
  const token = req.headers.authorization;
  const validatedUser = JWT.verify(token, signature);
  const tokenExpiration = validatedUser.exp * 1000;
  const currentDateinSeconds = new Date().getTime();
  const isValid = currentDateinSeconds < tokenExpiration;
  if (isValid) {
    const { is_admin } = validatedUser;
    if (is_admin) {
      req.is_admin = is_admin;
      next();
    } else {
      res.status(403).json("Forbidden");
    }
  } else {
    res.status(401).json("Token has expired. Please login again");
  }
}

async function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  try {
    const registeredUser = await findUserByUsername(username);
    if (registeredUser) {
      const { password: dbPassword, is_admin } = registeredUser;
      if (password === dbPassword) {
        const token = JWT.sign({ username, is_admin }, signature, {
          expiresIn: "15m"
        });
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

module.exports = { validateAuth, validateCredentials };
