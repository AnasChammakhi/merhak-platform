const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {

  const authorization =
    req.headers.authorization;


  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      success: false,
      message: "Vous devez être connecté.",
    });
  }


  const token =
    authorization.split(" ")[1];


  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    req.user = decoded;


    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
    });
  }
};


module.exports = authenticate;