const express = require("express");
const router = express.Router();

const {
  createStandardOrder,
  getOrders,
  getOrderById,
  updateOrderStatusAndNote,
  markAsPaid,
  deleteOrder,
} = require("../controllers/orderController");

router.get("/", getOrders);
router.post("/", createStandardOrder);
router.get("/:id", getOrderById);
router.patch("/:id", updateOrderStatusAndNote);
router.post("/:id/pay", markAsPaid);
router.delete("/:id", deleteOrder);

module.exports = router;
