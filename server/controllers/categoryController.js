const db = require("../config/database");

// Helper function to build category tree
function buildCategoryTree(categories, parentId = null) {
  const branch = [];
  for (const category of categories) {
    if (category.parent_id === parentId) {
      const children = buildCategoryTree(categories, category.id);
      branch.push({
        ...category,
        children,
      });
    }
  }
  return branch;
}

// ==========================================
// GET ALL CATEGORIES (Flat + Tree)
// ==========================================
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.parent_id,
        p.name AS parent_name,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count,
        (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) AS subcategory_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      ORDER BY c.parent_id IS NOT NULL, c.name ASC
    `);

    const tree = buildCategoryTree(rows, null);

    res.json({
      categories: rows,
      tree,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET CATEGORY BY ID
// ==========================================
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `
      SELECT
        c.id,
        c.name,
        c.description,
        c.parent_id,
        p.name AS parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE c.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    const category = rows[0];

    const [children] = await db.execute(
      `SELECT id, name, description, (SELECT COUNT(*) FROM products WHERE category_id = categories.id) AS product_count FROM categories WHERE parent_id = ? ORDER BY name ASC`,
      [id]
    );

    category.children = children;

    res.json(category);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE CATEGORY
// ==========================================
const createCategory = async (req, res, next) => {
  try {
    let { name, description, parentId } = req.body;

    name = name?.trim();
    description = description?.trim() || null;
    parentId = parentId ? Number(parentId) : null;

    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Le nom de la catégorie doit comporter au moins 2 caractères.",
      });
    }

    // Check if parent exists if specified
    if (parentId) {
      const [parentCheck] = await db.execute(
        "SELECT id FROM categories WHERE id = ?",
        [parentId]
      );
      if (parentCheck.length === 0) {
        return res.status(400).json({
          message: "La catégorie parente spécifiée n'existe pas.",
        });
      }
    }

    // Check unique name under same parent
    const [existing] = await db.execute(
      `SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND (parent_id = ? OR (parent_id IS NULL AND ? IS NULL))`,
      [name, parentId, parentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Une catégorie portant ce nom existe déjà à ce niveau.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
      [name, description, parentId]
    );

    const [newCategory] = await db.execute(
      `SELECT c.id, c.name, c.description, c.parent_id, p.name AS parent_name 
       FROM categories c 
       LEFT JOIN categories p ON c.parent_id = p.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Catégorie créée avec succès.",
      category: newCategory[0],
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE CATEGORY
// ==========================================
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { name, description, parentId } = req.body;

    name = name?.trim();
    description = description?.trim() || null;
    parentId = parentId ? Number(parentId) : null;

    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Le nom de la catégorie doit comporter au moins 2 caractères.",
      });
    }

    const [catRows] = await db.execute(
      "SELECT id, parent_id FROM categories WHERE id = ?",
      [id]
    );
    if (catRows.length === 0) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    // Cannot set self as parent
    if (parentId && Number(parentId) === Number(id)) {
      return res.status(400).json({
        message: "Une catégorie ne peut pas être sa propre catégorie parente.",
      });
    }

    // Check parent exists
    if (parentId) {
      const [parentCheck] = await db.execute(
        "SELECT id FROM categories WHERE id = ?",
        [parentId]
      );
      if (parentCheck.length === 0) {
        return res.status(400).json({
          message: "La catégorie parente spécifiée n'existe pas.",
        });
      }
    }

    // Update
    await db.execute(
      `UPDATE categories SET name = ?, description = ?, parent_id = ? WHERE id = ?`,
      [name, description, parentId, id]
    );

    const [updated] = await db.execute(
      `SELECT c.id, c.name, c.description, c.parent_id, p.name AS parent_name 
       FROM categories c 
       LEFT JOIN categories p ON c.parent_id = p.id 
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: "Catégorie modifiée avec succès.",
      category: updated[0],
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE CATEGORY
// ==========================================
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [catRows] = await db.execute(
      "SELECT id, name FROM categories WHERE id = ?",
      [id]
    );
    if (catRows.length === 0) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    // Check if products exist in this category
    const [products] = await db.execute(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
      [id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer cette catégorie car ${products[0].count} produit(s) y sont associés. Veuillez d'abord réassigner ou supprimer ces produits.`,
      });
    }

    await db.execute("DELETE FROM categories WHERE id = ?", [id]);

    res.json({
      message: "Catégorie supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SEED DEFAULT CATEGORIES (Homme / Femme / Subcategories)
// ==========================================
const seedCategories = async (req, res, next) => {
  try {
    const [existing] = await db.execute(
      "SELECT COUNT(*) as count FROM categories"
    );

    if (existing[0].count > 0) {
      return res.status(400).json({
        message:
          "Des catégories existent déjà. Veuillez les gérer directement.",
      });
    }

    // 1. Create top level Homme
    const [hommeRes] = await db.execute(
      `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
      ["Homme", "Collection prêt-à-porter et sur-mesure pour Homme", null]
    );
    const hommeId = hommeRes.insertId;

    // Homme subcategories
    const hommeSubs = [
      { name: "Chemises", desc: "Chemises en lin naturel, col mao, coton peigné" },
      { name: "Pantalons", desc: "Pantalons fluides, coupes droites et bermudas" },
      { name: "Vestes", desc: "Vestes sahariennes, costumes et blazers d'atelier" },
      { name: "Tuniques", desc: "Tuniques, gandouras et pièces traditionnelles revisitées" },
    ];
    for (const sub of hommeSubs) {
      await db.execute(
        `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
        [sub.name, sub.desc, hommeId]
      );
    }

    // 2. Create top level Femme
    const [femmeRes] = await db.execute(
      `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
      ["Femme", "Collection prêt-à-porter et sur-mesure pour Femme", null]
    );
    const femmeId = femmeRes.insertId;

    // Femme subcategories
    const femmeSubs = [
      { name: "Robes", desc: "Robes longues, drapées en lin et soie végétale" },
      { name: "Chemises", desc: "Chemisier fluide, blouses et tops en coton" },
      { name: "Pantalons", desc: "Pantalons palazzo et coupes larges" },
      { name: "Vestes", desc: "Vestes kimonos, blazers et manteaux légers" },
      { name: "Jupes", desc: "Jupes midi plissées et fluides" },
    ];
    for (const sub of femmeSubs) {
      await db.execute(
        `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
        [sub.name, sub.desc, femmeId]
      );
    }

    // 3. Create independent / accessories
    const [accRes] = await db.execute(
      `INSERT INTO categories (name, description, parent_id) VALUES (?, ?, ?)`,
      ["Accessoires", "Maroquinerie, ceintures et foulards", null]
    );

    res.status(201).json({
      message: "Catégories initiales créées avec succès.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
};
