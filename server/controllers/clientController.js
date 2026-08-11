const bcrypt = require("bcryptjs");
const db = require("../config/database");


// ========================================
// GET ALL CLIENTS
// ========================================

const getClients = async (req, res) => {

  try {

    const [clients] = await db.execute(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          role
        FROM users
        WHERE role = 'CLIENT'
        ORDER BY id DESC
      `
    );


    return res.status(200).json(
      clients
    );

  } catch (error) {

    console.error(
      "Get clients error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


// ========================================
// GET ONE CLIENT
// ========================================

const getClientById = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    const [clients] = await db.execute(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          role
        FROM users
        WHERE id = ?
        AND role = 'CLIENT'
        LIMIT 1
      `,
      [id]
    );


    if (clients.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Client introuvable.",
      });

    }


    return res.status(200).json(
      clients[0]
    );

  } catch (error) {

    console.error(error);


    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


// ========================================
// CREATE CLIENT
// ========================================

const createClient = async (
  req,
  res
) => {

  try {

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;


    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir les champs obligatoires.",
      });

    }


    const [existingUsers] =
      await db.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );


    if (existingUsers.length > 0) {

      return res.status(409).json({
        success: false,
        message:
          "Cet email existe déjà.",
      });

    }


    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    const [result] = await db.execute(
      `
        INSERT INTO users
        (
          first_name,
          last_name,
          email,
          phone,
          password,
          role
        )
        VALUES (?, ?, ?, ?, ?, 'CLIENT')
      `,
      [
        firstName,
        lastName,
        email,
        phone || null,
        hashedPassword,
      ]
    );


    return res.status(201).json({
      success: true,
      message:
        "Client créé avec succès.",
      clientId: result.insertId,
    });

  } catch (error) {

    console.error(error);


    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


// ========================================
// UPDATE CLIENT
// ========================================

const updateClient = async (
  req,
  res
) => {

  try {

    const { id } = req.params;

    const {
      firstName,
      lastName,
      email,
      phone,
    } = req.body;


    if (
      !firstName ||
      !lastName ||
      !email
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Informations obligatoires manquantes.",
      });

    }


    // Check client
    const [clients] = await db.execute(
      `
        SELECT id
        FROM users
        WHERE id = ?
        AND role = 'CLIENT'
      `,
      [id]
    );


    if (clients.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Client introuvable.",
      });

    }


    // Make sure another user
    // doesn't already use this email
    const [emailUsers] = await db.execute(
      `
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
      `,
      [
        email,
        id,
      ]
    );


    if (emailUsers.length > 0) {

      return res.status(409).json({
        success: false,
        message:
          "Cet email est déjà utilisé.",
      });

    }


    await db.execute(
      `
        UPDATE users

        SET
          first_name = ?,
          last_name = ?,
          email = ?,
          phone = ?

        WHERE id = ?
        AND role = 'CLIENT'
      `,
      [
        firstName,
        lastName,
        email,
        phone || null,
        id,
      ]
    );


    return res.status(200).json({
      success: true,
      message:
        "Client modifié avec succès.",
    });

  } catch (error) {

    console.error(error);


    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


// ========================================
// DELETE CLIENT
// ========================================

const deleteClient = async (
  req,
  res
) => {

  try {

    const { id } = req.params;


    const [result] = await db.execute(
      `
        DELETE FROM users
        WHERE id = ?
        AND role = 'CLIENT'
      `,
      [id]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        success: false,
        message: "Client introuvable.",
      });

    }


    return res.status(200).json({
      success: true,
      message:
        "Client supprimé avec succès.",
    });

  } catch (error) {

    console.error(error);


    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};