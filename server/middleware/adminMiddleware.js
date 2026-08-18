const db =
  require("../config/database");

const requireAdmin = async (
  req,
  res,
  next
) => {
  try {
    const [users] =
      await db.execute(
        `
          SELECT role
          FROM users
          WHERE id = ?
          LIMIT 1
        `,
        [req.session.userId]
      );

    if (
      users.length === 0 ||
      users[0].role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Accès réservé aux administrateurs.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireAdmin;