const express = require("express");
const { createStandardOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/", createStandardOrder);

module.exports = router;
