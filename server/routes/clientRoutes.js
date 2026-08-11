const express = require("express");

const router = express.Router();

const authenticate =
  require("../middleware/authMiddleware");

const requireAdmin =
  require("../middleware/adminMiddleware");

const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require(
  "../controllers/clientController"
);


// Every route below requires:
// 1. logged-in user
// 2. ADMIN role

router.use(
  authenticate,
  requireAdmin
);


router.get(
  "/",
  getClients
);


router.get(
  "/:id",
  getClientById
);


router.post(
  "/",
  createClient
);


router.put(
  "/:id",
  updateClient
);


router.delete(
  "/:id",
  deleteClient
);


module.exports = router;