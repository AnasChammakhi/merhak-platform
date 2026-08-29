const db = require("../config/database");

const normalizeImageUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
};

// ==========================================
// GET ALL PRODUCTS
// ==========================================
const getProducts = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.cost,
        p.fabric_type AS fabric,
        p.stock,
        p.active,
        p.category_id,
        c.name AS category,
        parent.name AS gender
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE p.active = true
      ORDER BY p.id DESC
    `);

    if (rows.length === 0) {
      return res.json([]);
    }

    for (const product of rows) {
      const [images] = await db.execute(
        `SELECT url FROM product_images WHERE product_id = ? ORDER BY id ASC`,
        [product.id]
      );

      product.images = (images || []).map((img) => normalizeImageUrl(img.url));
      product.image = product.images[0] || null;
    }

    res.json(rows);
  } catch (error) {
    console.error("getProducts error:", error);
    res.json([]);
  }
};

// ==========================================
// GET PRODUCT BY ID + SUGGESTIONS
// ==========================================
const getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Try DB first
    try {
      const [rows] = await db.execute(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.cost,
          p.fabric_type AS fabric,
          p.stock,
          p.active,
          p.category_id,
          c.name AS category,
          parent.name AS gender
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories parent ON c.parent_id = parent.id
        WHERE p.id = ?
      `,
        [id]
      );

      if (rows.length > 0) {
        const product = rows[0];

        // Fetch product images
        const [images] = await db.execute(
          `SELECT url FROM product_images WHERE product_id = ? ORDER BY id ASC`,
          [id]
        );
        product.images = (images || []).map((img) => normalizeImageUrl(img.url));
        product.image = product.images[0] || null;

        // Related suggestions
        const [related] = await db.execute(
          `
          SELECT p.id, p.name, p.price, p.fabric_type AS fabric, c.name AS category, parent.name AS gender
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN categories parent ON c.parent_id = parent.id
          WHERE p.id != ? AND (p.category_id = ? OR p.active = true)
          LIMIT 4
        `,
          [id, product.category_id]
        );

        for (const suggestion of related) {
          const [suggestionImages] = await db.execute(
            `SELECT url FROM product_images WHERE product_id = ? ORDER BY id ASC`,
            [suggestion.id]
          );
          suggestion.images = (suggestionImages || []).map((img) => normalizeImageUrl(img.url));
          suggestion.image = suggestion.images[0] || null;
        }

        return res.json({
          product,
          suggestions: related,
        });
      }
    } catch (e) {
      // ignore DB fallback to sample
    }

    return res.status(404).json({
      message: "Produit introuvable.",
      product: null,
      suggestions: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
};
