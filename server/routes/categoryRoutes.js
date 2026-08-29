const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require("../controllers/categoryController");

const router = express.Router();

// Public routes for fetching categories in Navbar / Store / Home
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only management routes
router.post("/", authenticate, requireAdmin, createCategory);
router.put("/:id", authenticate, requireAdmin, updateCategory);
router.delete("/:id", authenticate, requireAdmin, deleteCategory);
router.post("/seed", authenticate, requireAdmin, seedCategories);

module.exports = router;
