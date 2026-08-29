const db = require("../config/database");

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
  getOrders,
  getOrderById,
  updateOrderStatusAndNote,
  markAsPaid,
  deleteOrder,
};
