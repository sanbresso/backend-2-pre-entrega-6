function errorHandler(error, req, res, next) {
  let statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  let message =
    statusCode === 500
      ? "Error interno del servidor"
      : error.message || "Error en la solicitud";

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map(err => err.message)
      .join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Formato de dato inválido";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Ya existe un registro con esos datos";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    status: "error",
    message
  });
}

export default errorHandler;