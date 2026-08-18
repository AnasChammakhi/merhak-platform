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
            first_name,
            last_name,
            email,
            phone

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
            first_name,
            last_name,
            email,
            phone

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
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;


    firstName =
      firstName?.trim();

    lastName =
      lastName?.trim();

    email =
      email
        ?.trim()
        .toLowerCase();

    phone =
      phone?.trim() || null;


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


    if (
      password.length < 10 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mot de passe doit contenir entre 10 et 72 caractères.",
      });
    }


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


    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );


    const [result] =
      await db.execute(
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

          VALUES
          (?, ?, ?, ?, ?, 'CLIENT')
        `,
        [
          firstName,
          lastName,
          email,
          phone,
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
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;


    firstName =
      firstName?.trim();

    lastName =
      lastName?.trim();

    email =
      email
        ?.trim()
        .toLowerCase();

    phone =
      phone?.trim() || null;


    if (
      !firstName ||
      !lastName ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir les champs obligatoires.",
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
            first_name = ?,
            last_name = ?,
            email = ?,
            phone = ?,
            password = ?

          WHERE id = ?
          AND role = 'CLIENT'
        `,
        [
          firstName,
          lastName,
          email,
          phone,
          hashedPassword,
          id,
        ]
      );
    } else {
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
          phone,
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


module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};