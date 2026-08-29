const express = require("express");
const router = express.Router();

const { getCalendarOrders } = require("../controllers/calendarController");

router.get("/", getCalendarOrders);

module.exports = router;
