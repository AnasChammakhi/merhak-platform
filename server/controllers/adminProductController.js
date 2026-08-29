const fs = require("fs");
const path = require("path");
const db = require("../config/database");

const CLIENT_PUBLIC_ROOT = path.resolve(__dirname, "../../client/public");
const PRODUCT_ASSET_ROOT = path.join(CLIENT_PUBLIC_ROOT, "assets", "products");

// Helper function to create clean URL/folder slugs
function slugify(text) {
  if (!text) return "general";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace spaces and special chars with -
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing -
}

function resolveCategoryFolderSegments(categoryId) {
  let segments = ["general"];

  if (categoryId) {
    return db.execute(
      `SELECT c.name AS cat_name, p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.id = ?`,
      [categoryId]
    )
      .then(([rows]) => {
        if (rows.length > 0) {
          const { cat_name, parent_name } = rows[0];

          if (parent_name && cat_name) {
            segments = [slugify(parent_name), slugify(cat_name)];
          } else if (cat_name) {
            segments = [slugify(cat_name)];
          }
        }

        return segments;
      })
      .catch(() => segments);
  }

  return Promise.resolve(segments);
}

// Helper to determine and create target directory for a category
async function getCategoryUploadDir(categoryId) {
  const segments = await resolveCategoryFolderSegments(categoryId);
  const subDir = segments.join("/");

  const baseUploadDir = PRODUCT_ASSET_ROOT;
  const targetDir = path.join(baseUploadDir, subDir);

  fs.mkdirSync(baseUploadDir, { recursive: true });
  fs.mkdirSync(targetDir, { recursive: true });

  const relativeUrlPath = `/assets/products/${subDir.replace(/\\/g, "/")}`;

  return {
    targetDir,
    relativeUrlPath,
  };
}

function getAssetFileFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return null;
  }

  const normalizedUrl = url.replace(/\\/g, "/");
  const cleanUrl = normalizedUrl.startsWith("/") ? normalizedUrl.slice(1) : normalizedUrl;

  if (!cleanUrl.startsWith("assets/")) {
    return null;
  }

  return path.join(CLIENT_PUBLIC_ROOT, cleanUrl);
}

function removeAssetFileAndEmptyParents(url) {
  const filePath = getAssetFileFromUrl(url);
  if (!filePath || !fs.existsSync(filePath)) return;

  fs.unlinkSync(filePath);

  let currentDir = path.dirname(filePath);
  const stopDir = CLIENT_PUBLIC_ROOT;

  while (currentDir.startsWith(stopDir) && currentDir !== stopDir) {
    const entries = fs.readdirSync(currentDir);
    if (entries.length > 0) break;
    fs.rmdirSync(currentDir);
    currentDir = path.dirname(currentDir);
  }
}

// ==========================================
// GET ALL PRODUCTS (Admin View with Stats)
// ==========================================
const getAllAdminProducts = async (req, res, next) => {
  try {
    const [products] = await db.execute(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.cost,
        p.fabric_type AS fabric,
        p.delivery_cost,
        p.packaging_cost,
        p.stock,
        p.active,
        p.created_at,
        p.category_id,
        c.name AS category_name,
        parent.id AS parent_category_id,
        parent.name AS parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      ORDER BY p.id DESC
    `);

    // Fetch images and variants for each product
    for (const prod of products) {
      const [images] = await db.execute(
        "SELECT id, url FROM product_images WHERE product_id = ?",
        [prod.id]
      );
      prod.images = images;
      prod.image = images.length > 0 ? images[0].url : null;

      const [variants] = await db.execute(
        "SELECT id, size, color, stock, extra_price, sku FROM product_variants WHERE product_id = ?",
        [prod.id]
      );
      prod.variants = variants;
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET PRODUCT BY ID (Admin View)
// ==========================================
const getAdminProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT
        p.*,
        c.name AS category_name,
        parent.name AS parent_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    const product = rows[0];

    const [images] = await db.execute(
      "SELECT id, url FROM product_images WHERE product_id = ?",
      [id]
    );
    product.images = images;

    const [variants] = await db.execute(
      "SELECT id, size, color, stock, extra_price, sku FROM product_variants WHERE product_id = ?",
      [id]
    );
    product.variants = variants;

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPLOAD PRODUCT IMAGE WITH DYNAMIC DIRECTORY
// ==========================================
const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier image reçu." });
    }

    const categoryId = req.body.categoryId ? Number(req.body.categoryId) : null;
    const { targetDir, relativeUrlPath } = await getCategoryUploadDir(categoryId);

    // Generate unique sanitized filename
    const originalExt = path.extname(req.file.originalname) || ".jpg";
    const baseName = slugify(path.basename(req.file.originalname, originalExt));
    const fileName = `${baseName}-${Date.now()}${originalExt}`;
    const filePath = path.join(targetDir, fileName);

    // Save image file
    fs.writeFileSync(filePath, req.file.buffer);

    const relativeUrl = `${relativeUrlPath}/${fileName}`;

    res.json({
      message: "Image importée avec succès.",
      url: relativeUrl,
      fileName,
      folder: relativeUrlPath,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE PRODUCT
// ==========================================
const createProduct = async (req, res, next) => {
  try {
    let {
      name,
      categoryId,
      description,
      price,
      cost,
      fabricType,
      deliveryCost,
      packagingCost,
      stock,
      active,
      images,
      variants,
    } = req.body;

    name = name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Le nom du produit est obligatoire." });
    }
    if (!categoryId) {
      return res.status(400).json({ message: "Veuillez sélectionner une catégorie." });
    }
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ message: "Le prix de vente est obligatoire." });
    }

    const numericPrice = Number(price);
    const numericCost = cost !== undefined && !isNaN(Number(cost)) ? Number(cost) : 0;
    const numericDeliveryCost = deliveryCost ? Number(deliveryCost) : null;
    const numericPackagingCost = packagingCost ? Number(packagingCost) : null;
    const numericStock = stock !== undefined && !isNaN(Number(stock)) ? Number(stock) : 0;
    const isActive = active !== undefined ? Boolean(active) : true;

    // 1. Insert Product
    const [result] = await db.execute(
      `INSERT INTO products (
        category_id, name, description, price, cost,
        fabric_type, delivery_cost, packaging_cost, stock, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        name,
        description || null,
        numericPrice,
        numericCost,
        fabricType || null,
        numericDeliveryCost,
        numericPackagingCost,
        numericStock,
        isActive,
      ]
    );

    const productId = result.insertId;

    // 2. Insert Images if provided
    if (Array.isArray(images) && images.length > 0) {
      for (const imgUrl of images) {
        if (typeof imgUrl === "string" && imgUrl.trim()) {
          await db.execute(
            `INSERT INTO product_images (product_id, url) VALUES (?, ?)`,
            [productId, imgUrl.trim()]
          );
        }
      }
    }

    // 3. Insert Variants if provided
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        if (v.size && v.color) {
          const extraPrice = v.extraPrice ? Number(v.extraPrice) : null;
          const varStock = v.stock !== undefined ? Number(v.stock) : 0;
          const sku = v.sku || `SKU-${productId}-${slugify(v.size)}-${slugify(v.color)}`;
          await db.execute(
            `INSERT INTO product_variants (product_id, size, color, stock, extra_price, sku)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, v.size.trim(), v.color.trim(), varStock, extraPrice, sku]
          );
        }
      }
    }

    res.status(201).json({
      message: "Produit créé avec succès.",
      productId,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE PRODUCT
// ==========================================
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let {
      name,
      categoryId,
      description,
      price,
      cost,
      fabricType,
      deliveryCost,
      packagingCost,
      stock,
      active,
      images,
      variants,
    } = req.body;

    const [prodCheck] = await db.execute(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );
    if (prodCheck.length === 0) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    name = name?.trim();
    if (!name) {
      return res.status(400).json({ message: "Le nom du produit est obligatoire." });
    }

    const numericPrice = Number(price);
    const numericCost = cost !== undefined && !isNaN(Number(cost)) ? Number(cost) : 0;
    const numericDeliveryCost = deliveryCost ? Number(deliveryCost) : null;
    const numericPackagingCost = packagingCost ? Number(packagingCost) : null;
    const numericStock = stock !== undefined && !isNaN(Number(stock)) ? Number(stock) : 0;
    const isActive = active !== undefined ? Boolean(active) : true;

    // 1. Update Product Details
    await db.execute(
      `UPDATE products SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        cost = ?,
        fabric_type = ?,
        delivery_cost = ?,
        packaging_cost = ?,
        stock = ?,
        active = ?
      WHERE id = ?`,
      [
        categoryId,
        name,
        description || null,
        numericPrice,
        numericCost,
        fabricType || null,
        numericDeliveryCost,
        numericPackagingCost,
        numericStock,
        isActive,
        id,
      ]
    );

    // 2. Sync Images if array provided
    if (Array.isArray(images)) {
      const [existingImages] = await db.execute(
        "SELECT url FROM product_images WHERE product_id = ?",
        [id]
      );

      const incomingUrls = images
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter((img) => typeof img === "string" && img.trim())
        .map((img) => img.trim());

      const removedUrls = existingImages
        .map((img) => img.url)
        .filter((url) => !incomingUrls.includes(url));

      for (const removedUrl of removedUrls) {
        removeAssetFileAndEmptyParents(removedUrl);
      }

      await db.execute("DELETE FROM product_images WHERE product_id = ?", [id]);
      for (const urlStr of incomingUrls) {
        await db.execute(
          `INSERT INTO product_images (product_id, url) VALUES (?, ?)`,
          [id, urlStr]
        );
      }
    }

    // 3. Sync Variants if provided
    if (Array.isArray(variants)) {
      await db.execute("DELETE FROM product_variants WHERE product_id = ?", [id]);
      for (const v of variants) {
        if (v.size && v.color) {
          const extraPrice = v.extraPrice ? Number(v.extraPrice) : null;
          const varStock = v.stock !== undefined ? Number(v.stock) : 0;
          const sku = v.sku || `SKU-${id}-${slugify(v.size)}-${slugify(v.color)}`;
          await db.execute(
            `INSERT INTO product_variants (product_id, size, color, stock, extra_price, sku)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, v.size.trim(), v.color.trim(), varStock, extraPrice, sku]
          );
        }
      }
    }

    res.json({
      message: "Produit mis à jour avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE PRODUCT
// ==========================================
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [prodCheck] = await db.execute(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );
    if (prodCheck.length === 0) {
      return res.status(404).json({ message: "Produit introuvable." });
    }

    // Delete related images & variants
    const [images] = await db.execute("SELECT url FROM product_images WHERE product_id = ?", [id]);
    for (const item of images) {
      removeAssetFileAndEmptyParents(item.url);
    }

    await db.execute("DELETE FROM product_images WHERE product_id = ?", [id]);
    await db.execute("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await db.execute("DELETE FROM products WHERE id = ?", [id]);

    res.json({
      message: "Produit supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SEED DEFAULT PRODUCTS INTO DATABASE
// ==========================================
const seedDefaultProducts = async (req, res, next) => {
  try {
    const [count] = await db.execute("SELECT COUNT(*) as count FROM products");
    if (count[0].count > 0) {
      return res.status(400).json({
        message: "Des produits existent déjà dans la base de données.",
      });
    }

    // Fetch category IDs
    const [categories] = await db.execute("SELECT id, name FROM categories");
    const getCatId = (name) => {
      const found = categories.find((c) =>
        c.name.toLowerCase().includes(name.toLowerCase())
      );
      return found ? found.id : categories[0]?.id || 1;
    };

    const SAMPLE_SEED = [
      {
        name: "Chemise Col Officier en Lin Pur",
        catSearch: "Chemises",
        price: 145.0,
        cost: 70.0,
        fabric: "100% Lin naturel",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
        description: "Chemise homme à col mao en lin premium lavé, coupe décontractée.",
      },
      {
        name: "Pantalon Coupe Droite en Lin & Coton",
        catSearch: "Pantalons",
        price: 180.0,
        cost: 85.0,
        fabric: "Mélange Lin & Coton",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
        description: "Tombé fluide, taille avec cordon de serrage intérieur et poches italiennes.",
      },
      {
        name: "Veste Saharienne en Lin Épais",
        catSearch: "Vestes",
        price: 290.0,
        cost: 140.0,
        fabric: "100% Lin lourd",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        description: "Veste d'atelier non doublée, 4 poches plaquées à rabat, idéale mi-saison.",
      },
      {
        name: "Tunique Gandoura Contemporaine",
        catSearch: "Tuniques",
        price: 160.0,
        cost: 75.0,
        fabric: "Coton peigné & Lin",
        image: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80",
        description: "Coupe sobre et aérée, finitions coutures ton sur ton faites à la main.",
      },
      {
        name: "Robe Longue Drapée en Lin & Soie",
        catSearch: "Robes",
        price: 260.0,
        cost: 120.0,
        fabric: "Soie & Lin",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
        description: "Drapé vaporeux et silhouette sculptée, confectionnée dans notre atelier.",
      },
      {
        name: "Jupe Midi Évasée en Lin Pur",
        catSearch: "Jupes",
        price: 165.0,
        cost: 70.0,
        fabric: "100% Lin naturel",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
        description: "Jupe à taille élastiquée et poches invisibles latérales, mouvement gracieux.",
      },
    ];

    for (const item of SAMPLE_SEED) {
      const catId = getCatId(item.catSearch);
      const [res] = await db.execute(
        `INSERT INTO products (category_id, name, description, price, cost, fabric_type, stock, active)
         VALUES (?, ?, ?, ?, ?, ?, 15, true)`,
        [catId, item.name, item.description, item.price, item.cost, item.fabric]
      );
      const pId = res.insertId;
      await db.execute(
        `INSERT INTO product_images (product_id, url) VALUES (?, ?)`,
        [pId, item.image]
      );
    }

    res.status(201).json({
      message: "Catalogue initial créé avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdminProducts,
  getAdminProductById,
  uploadProductImage,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDefaultProducts,
};
