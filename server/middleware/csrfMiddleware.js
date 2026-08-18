const crypto = require("crypto");

const csrfToken = (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken =
      crypto.randomBytes(32).toString("hex");
  }

  res.json({
    success: true,
    csrfToken: req.session.csrfToken,
  });
};


const csrfProtection = (req, res, next) => {
  const safeMethods = [
    "GET",
    "HEAD",
    "OPTIONS",
  ];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const token =
    req.get("X-CSRF-Token");

  if (
    !token ||
    !req.session.csrfToken ||
    token !== req.session.csrfToken
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Requête de sécurité invalide.",
    });
  }

  next();
};


module.exports = {
  csrfToken,
  csrfProtection,
};