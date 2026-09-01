const db = require("../config/database");

const COLOR_HEX_BY_NAME = {
  blanc: "#f8f7f4",
  white: "#f8f7f4",
  crème: "#e7dcc4",
  naturel: "#d8c7a2",
  beige: "#d8c7a2",
  noir: "#1f1f1f",
  black: "#1f1f1f",
  bleu: "#1d4f7a",
  blue: "#1d4f7a",
  marine: "#1d4f7a",
  indigo: "#3c4f8d",
  vert: "#5d7b62",
  green: "#5d7b62",
  sage: "#7d8d75",
  gris: "#8d8d8d",
  grey: "#8d8d8d",
  argent: "#c8c9cc",
  rouge: "#a94442",
  red: "#a94442",
  rose: "#d7a6b8",
  violet: "#7261a8",
  orange: "#d4834f",
  jaune: "#d1b65c",
  gold: "#d1b65c",
  brun: "#7b4a2f",
  brown: "#7b4a2f",
  camel: "#b38752",
};

const normalizeImageUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    return raw;
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
};

const buildVariantMetadata = (variants = []) => {
  const uniqueSizes = [...new Set((variants || []).map((variant) => variant.size).filter(Boolean))];
  const uniqueColors = [...new Set((variants || []).map((variant) => variant.color).filter(Boolean))];

  const colorList = uniqueColors.map((name) => {
    const normalizedName = String(name).trim();
    const lookupKey = normalizedName.toLowerCase();
    const hex = Object.keys(COLOR_HEX_BY_NAME).find((key) => lookupKey.includes(key))
      ? COLOR_HEX_BY_NAME[Object.keys(COLOR_HEX_BY_NAME).find((key) => lookupKey.includes(key))]
      : "#d9d9d9";

    return {
      name: normalizedName,
      hex,
    };
  });

  return {
    sizes: uniqueSizes,
    colors: colorList,
  };
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

      const [variants] = await db.execute(
        `SELECT size, color, stock, extra_price, sku FROM product_variants WHERE product_id = ? ORDER BY id ASC`,
        [product.id]
      );

      const metadata = buildVariantMetadata(variants || []);
      product.variants = variants || [];
      product.sizes = metadata.sizes.length > 0 ? metadata.sizes : ["M"];
      product.colors = metadata.colors.length > 0 ? metadata.colors : [{ name: "Naturel", hex: "#d8c7a2" }];
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

        const [variants] = await db.execute(
          `SELECT size, color, stock, extra_price, sku FROM product_variants WHERE product_id = ? ORDER BY id ASC`,
          [id]
        );

        const metadata = buildVariantMetadata(variants || []);
        product.variants = variants || [];
        product.sizes = metadata.sizes.length > 0 ? metadata.sizes : ["M"];
        product.colors = metadata.colors.length > 0 ? metadata.colors : [{ name: "Naturel", hex: "#d8c7a2" }];

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
