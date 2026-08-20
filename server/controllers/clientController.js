const bcrypt =
  require("bcryptjs");

const db =
  require("../config/database");


// ==========================================
// GET ALL CLIENTS
// ==========================================

const getClients = async (
  req,
  res,
  next
) => {
  try {
    const [clients] =
      await db.execute(
        `
          SELECT
            id,
            name,
            email,
            phone,
            address

          FROM users

          WHERE role = 'CLIENT'

          ORDER BY id DESC
        `
      );

    res.json(clients);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// GET CLIENT
// ==========================================

const getClientById = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    const [clients] =
      await db.execute(
        `
          SELECT
            id,
            name,
            email,
            phone,
            address

          FROM users

          WHERE id = ?
          AND role = 'CLIENT'

          LIMIT 1
        `,
        [id]
      );


    if (
      clients.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Client introuvable.",
      });
    }


    res.json(
      clients[0]
    );
  } catch (error) {
    next(error);
  }
};


// ==========================================
// CREATE CLIENT
// ==========================================

const createClient = async (
  req,
  res,
  next
) => {
  try {
    let {
      name,
      email,
      phone,
      address,
      password,
    } = req.body;


    name =
      name?.trim();

    email =
      email
        ?.trim()
        .toLowerCase() || null;

    phone =
      phone?.trim() || null;
      
    address =
      address?.trim() || null;


    if (
      !name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir le nom.",
      });
    }


    if (
      password && (
      password.length < 10 ||
      password.length > 72)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mot de passe doit contenir entre 10 et 72 caractères.",
      });
    }


    if (email) {
      const [existing] =
        await db.execute(
          `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
          `,
          [email]
        );


      if (
        existing.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Cette adresse e-mail est déjà utilisée.",
        });
      }
    }


    let hashedPassword = null;
    if (password) {
      hashedPassword =
        await bcrypt.hash(
          password,
          12
        );
    }


    const [result] =
      await db.execute(
        `
          INSERT INTO users
          (
            name,
            email,
            phone,
            address,
            password,
            role
          )

          VALUES
          (?, ?, ?, ?, ?, 'CLIENT')
        `,
        [
          name,
          email,
          phone,
          address,
          hashedPassword,
        ]
      );


    res.status(201).json({
      success: true,
      message:
        "Client ajouté avec succès.",
      clientId:
        result.insertId,
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// UPDATE CLIENT
// ==========================================

const updateClient = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    let {
      name,
      email,
      phone,
      address,
      password,
    } = req.body;


    name =
      name?.trim();

    email =
      email
        ?.trim()
        .toLowerCase() || null;

    phone =
      phone?.trim() || null;

    address =
      address?.trim() || null;


    if (
      !name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir le nom.",
      });
    }


    const [clients] =
      await db.execute(
        `
          SELECT id
          FROM users
          WHERE id = ?
          AND role = 'CLIENT'
          LIMIT 1
        `,
        [id]
      );


    if (
      clients.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Client introuvable.",
      });
    }


    if (email) {
      const [existing] =
        await db.execute(
          `
            SELECT id
            FROM users
            WHERE email = ?
            AND id != ?
            LIMIT 1
          `,
          [email, id]
        );


      if (
        existing.length > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Cette adresse e-mail est déjà utilisée.",
        });
      }
    }


    if (password) {
      if (
        password.length < 10 ||
        password.length > 72
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Le nouveau mot de passe doit contenir entre 10 et 72 caractères.",
        });
      }


      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );


      await db.execute(
        `
          UPDATE users

          SET
            name = ?,
            email = ?,
            phone = ?,
            address = ?,
            password = ?

          WHERE id = ?
          AND role = 'CLIENT'
        `,
        [
          name,
          email,
          phone,
          address,
          hashedPassword,
          id,
        ]
      );
    } else {
      await db.execute(
        `
          UPDATE users

          SET
            name = ?,
            email = ?,
            phone = ?,
            address = ?

          WHERE id = ?
          AND role = 'CLIENT'
        `,
        [
          name,
          email,
          phone,
          address,
          id,
        ]
      );
    }


    res.json({
      success: true,
      message:
        "Client modifié avec succès.",
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// DELETE CLIENT
// ==========================================

const deleteClient = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;


    const [result] =
      await db.execute(
        `
          DELETE FROM users

          WHERE id = ?
          AND role = 'CLIENT'
        `,
        [id]
      );


    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Client introuvable.",
      });
    }


    res.json({
      success: true,
      message:
        "Client supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// GET MEASUREMENTS
// ==========================================

const getMeasurements = async (
  req,
  res,
  next
) => {
  try {
    const { id } =
      req.params;

    const [measurements] =
      await db.execute(
        `
          SELECT *
          FROM measurements
          WHERE client_id = ?
          ORDER BY created_at DESC
        `,
        [id]
      );

    res.json(measurements);
  } catch (error) {
    next(error);
  }
};


// ==========================================
// CREATE MEASUREMENT
// ==========================================

const createMeasurement = async (
  req,
  res,
  next
) => {
  try {
    const { id: clientId } =
      req.params;

    const {
      label,
      chestCirc,
      waistCirc,
      hipCirc,
      armCirc,
      wristCirc,
      frontSquare,
      backSquare,
      shoulderLen,
      walkLen,
      frontLen,
      dressLen,
      shirtLen,
      skirtLen,
      pantsLen,
      chestLen,
      other,
    } = req.body;

    const finalLabel = label?.trim() || "Moi";

    // verify client exists
    const [clients] = await db.execute(
      `SELECT id FROM users WHERE id = ? AND role = 'CLIENT' LIMIT 1`,
      [clientId]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Client introuvable.",
      });
    }

    const [result] = await db.execute(
      `
        INSERT INTO measurements
        (
          client_id, label, chest_circ, waist_circ, hip_circ,
          arm_circ, wrist_circ, front_square, back_square, shoulder_len,
          walk_len, front_len, dress_len, shirt_len, skirt_len,
          pants_len, chest_len, other
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientId,
        finalLabel,
        chestCirc || null,
        waistCirc || null,
        hipCirc || null,
        armCirc || null,
        wristCirc || null,
        frontSquare || null,
        backSquare || null,
        shoulderLen || null,
        walkLen || null,
        frontLen || null,
        dressLen || null,
        shirtLen || null,
        skirtLen || null,
        pantsLen || null,
        chestLen || null,
        other?.trim() || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Mesures ajoutées avec succès.",
      measurementId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// UPDATE MEASUREMENT
// ==========================================

const updateMeasurement = async (
  req,
  res,
  next
) => {
  try {
    const { id: clientId, measurementId } = req.params;

    const {
      label,
      chestCirc,
      waistCirc,
      hipCirc,
      armCirc,
      wristCirc,
      frontSquare,
      backSquare,
      shoulderLen,
      walkLen,
      frontLen,
      dressLen,
      shirtLen,
      skirtLen,
      pantsLen,
      chestLen,
      other,
    } = req.body;

    const finalLabel = label?.trim() || "Moi";

    const [result] = await db.execute(
      `
        UPDATE measurements
        SET
          label = ?,
          chest_circ = ?,
          waist_circ = ?,
          hip_circ = ?,
          arm_circ = ?,
          wrist_circ = ?,
          front_square = ?,
          back_square = ?,
          shoulder_len = ?,
          walk_len = ?,
          front_len = ?,
          dress_len = ?,
          shirt_len = ?,
          skirt_len = ?,
          pants_len = ?,
          chest_len = ?,
          other = ?
        WHERE id = ? AND client_id = ?
      `,
      [
        finalLabel,
        chestCirc || null,
        waistCirc || null,
        hipCirc || null,
        armCirc || null,
        wristCirc || null,
        frontSquare || null,
        backSquare || null,
        shoulderLen || null,
        walkLen || null,
        frontLen || null,
        dressLen || null,
        shirtLen || null,
        skirtLen || null,
        pantsLen || null,
        chestLen || null,
        other?.trim() || null,
        measurementId,
        clientId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mesures introuvables.",
      });
    }

    res.json({
      success: true,
      message: "Mesures modifiées avec succès.",
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// DELETE MEASUREMENT
// ==========================================

const deleteMeasurement = async (
  req,
  res,
  next
) => {
  try {
    const { id: clientId, measurementId } = req.params;

    // verify if used in an order
    const [usage] = await db.execute(
      `SELECT id FROM custom_order_details WHERE measurement_id = ? LIMIT 1`,
      [measurementId]
    );

    if (usage.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer ces mesures car elles sont utilisées dans une commande sur-mesure.",
      });
    }

    const [result] = await db.execute(
      `
        DELETE FROM measurements
        WHERE id = ? AND client_id = ?
      `,
      [measurementId, clientId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mesures introuvables.",
      });
    }

    res.json({
      success: true,
      message: "Mesures supprimées avec succès.",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
};