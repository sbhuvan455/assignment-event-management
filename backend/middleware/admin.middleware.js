
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(400).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};