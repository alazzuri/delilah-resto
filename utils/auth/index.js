const { JWT, signature } = require("../../auth");
const { findUserbyUsername } = require("../users");

async function validateCredentials(req, res, next) {
  const { username, password } = req.body;
  try {
    const registeredUser = await findUserbyUsername(username);
    if (registeredUser) {
      const { password: dbPassword, isAdmin } = registeredUser;
      if (password === dbPassword) {
        const token = JWT.sign({ username, isAdmin }, signature);
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
  const { isAdmin } = validatedUser;
  if (isAdmin) {
    req.isAdmin = isAdmin;
    next();
  } else {
    res.status(403).json("Forbidden");
  }
}

module.exports = { validateCredentials, validateAuth };
