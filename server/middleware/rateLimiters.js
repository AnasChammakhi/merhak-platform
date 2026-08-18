const rateLimit = require("express-rate-limit").rateLimit;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Trop de créations de comptes. Réessayez plus tard.",
  },
});

module.exports = {
  loginLimiter,
  registerLimiter,
};