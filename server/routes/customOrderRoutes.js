const express = require("express");
const {
  getCustomOrders,
  getCustomOrderById,
  createCustomOrder,
  updateCustomOrder,
  deleteCustomOrder,
} = require("../controllers/customOrderController");

const router = express.Router();

router.get("/", getCustomOrders);
router.post("/", createCustomOrder);
router.get("/:id", getCustomOrderById);
router.put("/:id", updateCustomOrder);
router.delete("/:id", deleteCustomOrder);

module.exports = router;
