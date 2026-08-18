const notFound = (
  req,
  res
) => {
  res.status(404).json({
    success: false,
    message:
      "Route introuvable.",
  });
};

const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message:
      "Une erreur serveur est survenue.",
  });
};

module.exports = {
  notFound,
  errorHandler,
};