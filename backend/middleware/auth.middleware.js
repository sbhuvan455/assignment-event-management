import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User associated with this token no longer exists",
      });
    }

    req.user = user;

    next();
  } catch (error) {

    return res.status(400).json({
    success: false,
    message: "Invalid access token",
    });

  }
};
