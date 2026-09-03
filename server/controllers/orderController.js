const db = require("../config/database");

const createStandardOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { firstName, lastName, phone, address, note, deliveryMethod, paymentMethod, items } = req.body;
    if (!firstName || !lastName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      const error = new Error("Veuillez remplir vos coordonnées et ajouter au moins un article.");
      error.status = 400;
      throw error;
    }

    await connection.beginTransaction();
    let total = 0;
    const validatedItems = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantité invalide.");
      const [products] = await connection.execute(
        `SELECT p.id, p.price, p.stock, pv.id AS variant_id, pv.stock AS variant_stock, pv.extra_price,
          (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) AS variant_count
         FROM products p LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.size = ? AND pv.color = ?
         WHERE p.id = ? AND p.active = true`,
        [item.size || "", item.color || "", item.productId]
      );
      if (!products.length) throw new Error("Un article de votre panier n'est plus disponible.");
      const product = products[0];
      if (product.variant_count > 0 && !product.variant_id) throw new Error("La taille ou la couleur sélectionnée n'est plus disponible.");
      const availableStock = product.variant_id ? product.variant_stock : product.stock;
      if (availableStock !== null && availableStock < quantity) throw new Error("Stock insuffisant pour un article sélectionné.");
      const unitPrice = Number(product.price) + Number(product.extra_price || 0);
      total += unitPrice * quantity;
      validatedItems.push({ ...item, variantId: product.variant_id, unitPrice });
    }

    const summary = [deliveryMethod, paymentMethod, note].filter(Boolean).join(" | ") || null;
    const [result] = await connection.execute(
      `INSERT INTO orders (client_id, first_name, last_name, phone, address, type, status, note, total_price, created_at)
       VALUES (?, ?, ?, ?, ?, 'STANDARD', 'NEW', ?, ?, NOW())`,
      [req.session?.userId || null, firstName.trim(), lastName.trim(), phone.trim(), address.trim(), summary, total.toFixed(2)]
    );
    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, item.productId, item.variantId, item.quantity, item.unitPrice.toFixed(2)]
      );
      if (item.variantId) await connection.execute(`UPDATE product_variants SET stock = stock - ? WHERE id = ?`, [item.quantity, item.variantId]);
      else await connection.execute(`UPDATE products SET stock = stock - ? WHERE id = ?`, [item.quantity, item.productId]);
    }
    await connection.commit();
    res.status(201).json({ id: result.insertId, totalPrice: total.toFixed(2) });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// ==========================================
// GET ALL ORDERS
// ==========================================
const getOrders = async (req, res, next) => {
  try {
    const { search, type, status, startDate, endDate } = req.query;

    let query = `
      SELECT 
        o.id, o.client_id, o.first_name, o.last_name, o.phone, o.address, 
        o.type, o.status, o.total_price, o.created_at,
        CASE 
          WHEN MAX(CASE WHEN fe.type = 'CUSTOM_ORDER' THEN 1 ELSE 0 END) = 1 THEN 'PAID'
          WHEN MAX(CASE WHEN fe.direction = 'INCOME' AND o.type = 'STANDARD' THEN 1 ELSE 0 END) = 1 THEN 'PAID'
          WHEN MAX(CASE WHEN fe.type = 'DEPOSIT' THEN 1 ELSE 0 END) = 1 THEN 'DEPOSIT'
          ELSE 'UNPAID'
        END AS payment_status
      FROM orders o
      LEFT JOIN finance_entries fe ON o.id = fe.order_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (o.first_name LIKE ? OR o.last_name LIKE ? OR o.phone LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (type) {
      query += ` AND o.type = ?`;
      params.push(type);
    }
    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }
    if (startDate) {
      query += ` AND o.created_at >= ?`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query += ` AND o.created_at <= ?`;
      params.push(end);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    const [orders] = await db.execute(query, params);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ORDER BY ID
// ==========================================
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) {
      const err = new Error("Commande introuvable.");
      err.status = 404;
      throw err;
    }

    const order = orders[0];

    // Get finance entries
    const [financeEntries] = await db.execute(
      `SELECT * FROM finance_entries WHERE order_id = ?`,
      [id]
    );
    order.financeEntries = financeEntries;

    if (order.type === 'STANDARD') {
      const [items] = await db.execute(
        `SELECT oi.*, p.name as product_name, pv.size, pv.color 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_variants pv ON oi.variant_id = pv.id
         WHERE oi.order_id = ?`,
        [id]
      );
      order.items = items;
    } else if (order.type === 'CUSTOM') {
      const [customDetails] = await db.execute(
        `SELECT * FROM custom_order_details WHERE order_id = ?`,
        [id]
      );
      if (customDetails.length > 0) {
        order.customDetail = customDetails[0];
        const [measurements] = await db.execute(
          `SELECT * FROM measurements WHERE id = ?`,
          [order.customDetail.measurement_id]
        );
        order.customDetail.measurement = measurements.length > 0 ? measurements[0] : null;
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE ORDER STATUS & NOTE
// ==========================================
const updateOrderStatusAndNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (note !== undefined) {
      updates.push("note = ?");
      params.push(note);
    }

    if (updates.length > 0) {
      params.push(id);
      await db.execute(
        `UPDATE orders SET ${updates.join(", ")} WHERE id = ?`,
        params
      );
    }

    const [orders] = await db.execute(`SELECT * FROM orders WHERE id = ?`, [id]);
    res.json(orders[0]);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MARK AS PAID (CUSTOM ORDERS ONLY)
// ==========================================
const markAsPaid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0) {
      const err = new Error("Commande introuvable.");
      err.status = 404;
      throw err;
    }
    const order = orders[0];

    if (order.type !== 'CUSTOM') {
      const err = new Error("Seules les commandes sur-mesure peuvent être marquées comme payées de cette façon.");
      err.status = 400;
      throw err;
    }

    const [customDetails] = await db.execute(`SELECT * FROM custom_order_details WHERE order_id = ?`, [id]);
    if (customDetails.length === 0) {
      const err = new Error("Détails sur-mesure introuvables.");
      err.status = 400;
      throw err;
    }
    const customDetail = customDetails[0];

    const [financeEntries] = await db.execute(`SELECT * FROM finance_entries WHERE order_id = ? AND type = 'CUSTOM_ORDER'`, [id]);
    if (financeEntries.length > 0) {
      const err = new Error("Cette commande a déjà été payée.");
      err.status = 400;
      throw err;
    }

    const finalPrice = Number(customDetail.final_price || 0);
    const depositAmount = Number(customDetail.deposit_amount || 0);
    const amountDue = finalPrice - depositAmount;

    if (amountDue <= 0) {
      const err = new Error("Aucun solde restant à payer.");
      err.status = 400;
      throw err;
    }

    await db.execute(
      `INSERT INTO finance_entries (type, direction, amount, description, order_id, date) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ['CUSTOM_ORDER', 'INCOME', amountDue, `Paiement du solde pour la commande sur-mesure #${id}`, id]
    );

    res.json({ message: "Paiement enregistré avec succès." });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE ORDER
// ==========================================
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [financeEntries] = await db.execute(`SELECT id FROM finance_entries WHERE order_id = ? LIMIT 1`, [id]);
    if (financeEntries.length > 0) {
      const err = new Error("Impossible de supprimer cette commande car elle est liée à une ou plusieurs écritures comptables (FinanceEntry).");
      err.status = 400;
      throw err;
    }

    await db.execute(`DELETE FROM orders WHERE id = ?`, [id]);
    res.json({ message: "Commande supprimée avec succès." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStandardOrder,
  getOrders,
  getOrderById,
  updateOrderStatusAndNote,
  markAsPaid,
  deleteOrder,
};
