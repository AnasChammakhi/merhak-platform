const authenticate = (
  req,
  res,
  next
) => {
  if (
    !req.session ||
    !req.session.userId
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Vous devez être connecté.",
    });
  }

  next();
};

module.exports = authenticate;