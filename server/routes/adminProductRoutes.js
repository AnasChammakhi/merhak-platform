const express = require("express");
const multer = require("multer");

const authenticate = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
  getAllAdminProducts,
  getAdminProductById,
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDefaultProducts,
} = require("../controllers/adminProductController");

// Configure Multer for in-memory handling before custom directory routing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers image (JPG, PNG, WebP) sont autorisés."));
    }
  },
});

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/", getAllAdminProducts);
router.get("/:id", getAdminProductById);
router.post("/upload-image", upload.single("image"), uploadProductImage);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/seed", seedDefaultProducts);

module.exports = router;
