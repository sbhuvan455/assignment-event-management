
export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message,
  });
};