const bcrypt =
  require("bcryptjs");

const db =
  require("../config/database");


// ==========================================
// REGISTER
// ==========================================

const register = async (
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
        .toLowerCase();

    phone =
      phone?.trim() || null;

    address =
      address?.trim() || null;


    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Veuillez remplir tous les champs obligatoires.",
      });
    }


    if (
      name.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le nom est trop long.",
      });
    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(email)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Adresse e-mail invalide.",
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


    if (
      phone &&
      phone.length > 30
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Numéro de téléphone invalide.",
      });
    }


    const [existingUsers] =
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
      existingUsers.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Un compte existe déjà avec cette adresse e-mail.",
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
            name,
            email,
            password,
            phone,
            address
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          name,
          email,
          hashedPassword,
          phone,
          address,
        ]
      );


    return res.status(201).json({
      success: true,
      message:
        "Votre compte a été créé avec succès.",
      userId:
        result.insertId,
    });
  } catch (error) {
    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Un compte existe déjà avec cette adresse e-mail.",
      });
    }

    next(error);
  }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (
  req,
  res,
  next
) => {
  try {
    let {
      email,
      password,
    } = req.body;

    email =
      email
        ?.trim()
        .toLowerCase();


    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Adresse e-mail et mot de passe requis.",
      });
    }


    const [users] =
      await db.execute(
        `
          SELECT
            id,
            name,
            email,
            password,
            phone,
            address,
            role

          FROM users

          WHERE email = ?

          LIMIT 1
        `,
        [email]
      );


    if (
      users.length === 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Adresse e-mail ou mot de passe incorrect.",
      });
    }


    const user =
      users[0];


    const passwordValid =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Adresse e-mail ou mot de passe incorrect.",
      });
    }


    req.session.regenerate(
      (error) => {
        if (error) {
          return next(error);
        }


        req.session.userId =
          user.id;

        req.session.role =
          user.role;


        req.session.save(
          (saveError) => {
            if (saveError) {
              return next(
                saveError
              );
            }


            return res.json({
              success: true,

              message:
                "Connexion réussie.",

              user: {
                id:
                  user.id,

                name:
                  user.name,

                email:
                  user.email,

                phone:
                  user.phone,

                address:
                  user.address,

                role:
                  user.role,
              },
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
};


// ==========================================
// CURRENT USER
// ==========================================

const me = async (
  req,
  res,
  next
) => {
  try {
    if (
      !req.session.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Vous n'êtes pas connecté.",
      });
    }


    const [users] =
      await db.execute(
        `
          SELECT
            id,
            name,
            email,
            phone,
            address,
            role

          FROM users

          WHERE id = ?

          LIMIT 1
        `,
        [
          req.session.userId,
        ]
      );


    if (
      users.length === 0
    ) {
      req.session.destroy(
        () => {}
      );

      return res.status(401).json({
        success: false,
        message:
          "Session invalide.",
      });
    }


    const user =
      users[0];


    req.session.role =
      user.role;


    return res.json({
      success: true,

      user: {
        id:
          user.id,

        name:
          user.name,

        email:
          user.email,

        phone:
          user.phone,

        address:
          user.address,

        role:
          user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// LOGOUT
// ==========================================

const logout = (
  req,
  res,
  next
) => {
  req.session.destroy(
    (error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(
        "merhak.sid",
        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            "production",

          sameSite: "lax",

          path: "/",
        }
      );

      res.json({
        success: true,
        message:
          "Déconnexion réussie.",
      });
    }
  );
};


module.exports = {
  register,
  login,
  me,
  logout,
};