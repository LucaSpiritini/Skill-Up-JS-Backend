const jwt = require("jsonwebtoken");

async function generateToken(object) {
  return new Promise(function (resolve, reject) {
    jwt.sign(
      object,
      process.env.SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (error, token) => {
        if (error) {
          reject(error);
        }
        resolve(token);
      }
    );
  });
}

async function verifyJwt(token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, process.env.SECRET, (error, authData) => {
      if (error) {
        reject(error);
      }
      resolve(authData);
    });
  });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "access unauthorized" });
  }

  const bearerToken = authHeader.split(" ")[1];

  try {
    const payload = await verifyJwt(bearerToken);
    req.body.id = payload.id;
    req.body.email = payload.email;
    return next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "access forbidden", error: error.message });
  }
}

module.exports = {
  generateToken,
  verifyJwt,
  authMiddleware,
};
