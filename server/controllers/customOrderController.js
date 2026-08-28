const db = require("../config/database");

// ==========================================
// GET ALL CUSTOM ORDERS
// ==========================================
const getCustomOrders = async (req, res, next) => {
  try {
    const { search, status, startDate, endDate } = req.query;

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
      WHERE o.type = 'CUSTOM'
    `;
    const params = [];

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (o.first_name LIKE ? OR o.last_name LIKE ? OR o.phone LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
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
// GET CUSTOM ORDER BY ID
// ==========================================
const getCustomOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(
      `SELECT * FROM orders WHERE id = ? AND type = 'CUSTOM'`,
      [id]
    );

    if (orders.length === 0) {
      const err = new Error("Commande sur-mesure introuvable.");
      err.status = 404;
      throw err;
    }

    const order = orders[0];

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

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE CUSTOM ORDER
// ==========================================
const createCustomOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      existingClientId, newClientName, newClientPhone,
      existingMeasurementId, newMeasurementLabel, newMeasurementData,
      articleName, note,
      fabricProvidedByClient, fabricPricePerMeter, metersNeeded, fabricTotalPrice,
      subcontractingCost, laborCost, recommendedPrice, finalPrice,
      depositAmount, depositDate,
      startDate, endDate, deliveryDate,
      imageUrl
    } = req.body;

    // 1. Resolve Client
    let clientId = existingClientId;
    let firstName = "", lastName = "", phone = newClientPhone || "", address = "";
    
    if (clientId) {
      const [users] = await connection.execute(`SELECT name, phone, address FROM users WHERE id = ?`, [clientId]);
      if (users.length === 0) throw new Error("Client introuvable.");
      const client = users[0];
      const nameParts = client.name.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
      phone = client.phone || "";
      address = client.address || "";
    } else if (newClientName) {
      const [result] = await connection.execute(
        `INSERT INTO users (name, phone, role) VALUES (?, ?, 'CLIENT')`,
        [newClientName, newClientPhone || null]
      );
      clientId = result.insertId;
      const nameParts = newClientName.split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      throw new Error("Client manquant.");
    }

    // 2. Resolve Measurement
    let measurementId = existingMeasurementId;
    if (!measurementId) {
      if (!newMeasurementLabel) throw new Error("Profil de mesure manquant.");
      
      const {
        chestCirc, waistCirc, hipCirc, armCirc, wristCirc, 
        frontSquare, backSquare, shoulderLen, walkLen, frontLen, 
        dressLen, shirtLen, skirtLen, pantsLen, chestLen, other
      } = newMeasurementData || {};

      const [mResult] = await connection.execute(
        `INSERT INTO measurements (
          client_id, label, chest_circ, waist_circ, hip_circ, arm_circ, wrist_circ,
          front_square, back_square, shoulder_len, walk_len, front_len,
          dress_len, shirt_len, skirt_len, pants_len, chest_len, other
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId, newMeasurementLabel,
          chestCirc || null, waistCirc || null, hipCirc || null, armCirc || null, wristCirc || null,
          frontSquare || null, backSquare || null, shoulderLen || null, walkLen || null, frontLen || null,
          dressLen || null, shirtLen || null, skirtLen || null, pantsLen || null, chestLen || null,
          other || null
        ]
      );
      measurementId = mResult.insertId;
    } else {
      const [existingMeasurement] = await connection.execute(
        `SELECT id FROM measurements WHERE id = ? AND client_id = ?`,
        [measurementId, clientId]
      );
      if (existingMeasurement.length === 0) {
        const err = new Error("Ce profil de mesures n'appartient pas à ce client.");
        err.status = 400;
        throw err;
      }
    }

    if (!startDate || !endDate || !deliveryDate || !articleName) {
      throw new Error("Veuillez remplir les champs obligatoires (Dates et Article).");
    }

    // 3. Create Order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (client_id, first_name, last_name, phone, address, type, status, note, total_price, created_at)
       VALUES (?, ?, ?, ?, ?, 'CUSTOM', 'NEW', ?, ?, NOW())`,
      [clientId, firstName, lastName, phone, address, note || null, finalPrice || 0]
    );
    const orderId = orderResult.insertId;

    // 4. Create CustomOrderDetail
    await connection.execute(
      `INSERT INTO custom_order_details (
        order_id, measurement_id, article_name, note,
        fabric_provided_by_client, fabric_price_per_meter, meters_needed, fabric_total_price,
        subcontracting_cost, labor_cost, recommended_price, final_price,
        deposit_amount, deposit_date, image_url, start_date, end_date, delivery_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, measurementId, articleName, note || null,
        fabricProvidedByClient ? 1 : 0, 
        fabricPricePerMeter || null, metersNeeded || null, fabricTotalPrice || null,
        subcontractingCost || 0, laborCost || 0, recommendedPrice || 0, finalPrice || 0,
        depositAmount || null, depositDate ? new Date(depositDate) : null, imageUrl || null,
        new Date(startDate), new Date(endDate), new Date(deliveryDate)
      ]
    );

    // 5. Create FinanceEntry if deposit > 0
    if (depositAmount && Number(depositAmount) > 0) {
      await connection.execute(
        `INSERT INTO finance_entries (type, direction, amount, description, order_id, date)
         VALUES ('DEPOSIT', 'INCOME', ?, ?, ?, ?)`,
        [
          depositAmount,
          `Acompte pour commande sur-mesure #${orderId}`,
          orderId,
          depositDate ? new Date(depositDate) : new Date()
        ]
      );
    }

    await connection.commit();
    res.json({ message: "Commande sur-mesure créée avec succès.", id: orderId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// ==========================================
// UPDATE CUSTOM ORDER DETAILS
// ==========================================
const updateCustomOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    
    // Check if order exists and is CUSTOM
    const [orders] = await connection.execute(`SELECT id FROM orders WHERE id = ? AND type = 'CUSTOM'`, [id]);
    if (orders.length === 0) {
      const err = new Error("Commande sur-mesure introuvable.");
      err.status = 404;
      throw err;
    }

    const {
      articleName, note,
      fabricProvidedByClient, fabricPricePerMeter, metersNeeded, fabricTotalPrice,
      subcontractingCost, laborCost, recommendedPrice, finalPrice,
      startDate, endDate, deliveryDate,
      imageUrl
    } = req.body;

    if (!startDate || !endDate || !deliveryDate || !articleName) {
      throw new Error("Veuillez remplir les champs obligatoires (Dates et Article).");
    }

    // Check if fully paid (CUSTOM_ORDER finance entry exists)
    const [financeEntries] = await connection.execute(
      `SELECT id FROM finance_entries WHERE order_id = ? AND type = 'CUSTOM_ORDER'`,
      [id]
    );
    
    if (financeEntries.length > 0) {
      // Check if any price fields changed
      const [currentDetails] = await connection.execute(
        `SELECT subcontracting_cost, labor_cost, fabric_price_per_meter, meters_needed, fabric_total_price, final_price FROM custom_order_details WHERE order_id = ?`,
        [id]
      );
      
      if (currentDetails.length > 0) {
        const current = currentDetails[0];
        const priceFieldsChanged = 
          Number(current.subcontracting_cost || 0) !== Number(subcontractingCost || 0) ||
          Number(current.labor_cost || 0) !== Number(laborCost || 0) ||
          Number(current.fabric_price_per_meter || 0) !== Number(fabricPricePerMeter || 0) ||
          Number(current.meters_needed || 0) !== Number(metersNeeded || 0) ||
          Number(current.fabric_total_price || 0) !== Number(fabricTotalPrice || 0) ||
          Number(current.final_price || 0) !== Number(finalPrice || 0);
          
        if (priceFieldsChanged) {
          const err = new Error("Commande déjà soldée, modification du prix impossible.");
          err.status = 400;
          throw err;
        }
      }
    }

    // Note: depositAmount and depositDate are deliberately EXCLUDED from updates here
    // to avoid tampering with financial records that might already be inserted.

    // 1. Update orders table
    await connection.execute(
      `UPDATE orders SET total_price = ?, note = ? WHERE id = ?`,
      [finalPrice || 0, note || null, id]
    );

    // 2. Update custom_order_details
    await connection.execute(
      `UPDATE custom_order_details SET
        article_name = ?, note = ?,
        fabric_provided_by_client = ?, fabric_price_per_meter = ?, meters_needed = ?, fabric_total_price = ?,
        subcontracting_cost = ?, labor_cost = ?, recommended_price = ?, final_price = ?,
        image_url = ?, start_date = ?, end_date = ?, delivery_date = ?
       WHERE order_id = ?`,
      [
        articleName, note || null,
        fabricProvidedByClient ? 1 : 0, 
        fabricPricePerMeter || null, metersNeeded || null, fabricTotalPrice || null,
        subcontractingCost || 0, laborCost || 0, recommendedPrice || 0, finalPrice || 0,
        imageUrl || null,
        new Date(startDate), new Date(endDate), new Date(deliveryDate),
        id
      ]
    );

    await connection.commit();
    res.json({ message: "Commande sur-mesure mise à jour avec succès." });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};


// ==========================================
// DELETE CUSTOM ORDER
// ==========================================
const deleteCustomOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(`SELECT type FROM orders WHERE id = ?`, [id]);
    if (orders.length === 0 || orders[0].type !== 'CUSTOM') {
      const err = new Error("Commande sur-mesure introuvable.");
      err.status = 404;
      throw err;
    }

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
  getCustomOrders,
  getCustomOrderById,
  createCustomOrder,
  updateCustomOrder,
  deleteCustomOrder,
};
