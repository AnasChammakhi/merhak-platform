const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");


// ========================================
// REGISTER
// ========================================

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = req.body;


    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez remplir tous les champs obligatoires.",
      });
    }


    // Check if email already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );


    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email.",
      });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    // Create user
    // No role is sent because DB default = CLIENT
    const [result] = await db.execute(
      `
        INSERT INTO users
        (
          first_name,
          last_name,
          email,
          password,
          phone
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        phone || null,
      ]
    );


    return res.status(201).json({
      success: true,
      message: "Compte créé avec succès.",
      userId: result.insertId,
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis.",
      });
    }


    const [users] = await db.execute(
      `
        SELECT
          id,
          first_name,
          last_name,
          email,
          password,
          phone,
          role
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );


    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }


    const user = users[0];


    // Compare typed password with hashed password
    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );


    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect.",
      });
    }


    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );


    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",

      token,

      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
};


module.exports = {
  register,
  login,
};