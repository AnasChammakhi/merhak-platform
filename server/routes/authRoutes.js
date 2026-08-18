const express = require("express");

const router = express.Router();

const {
  register,
  login,
  me,
  logout,
} = require("../controllers/authController");

const {
  loginLimiter,
  registerLimiter,
} = require("../middleware/rateLimiters");

const {
  csrfToken,
} = require("../middleware/csrfMiddleware");


// Get CSRF token
router.get(
  "/csrf",
  csrfToken
);


// Current connected user
router.get(
  "/me",
  me
);


// Register
router.post(
  "/register",
  registerLimiter,
  register
);


// Login
router.post(
  "/login",
  loginLimiter,
  login
);


// Logout
router.post(
  "/logout",
  logout
);


module.exports = router;