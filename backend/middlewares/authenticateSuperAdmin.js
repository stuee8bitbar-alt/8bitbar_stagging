import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const cookieToken = req.cookies.token;
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Superadmin privileges required.",
      });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (error) {
    console.error("Superadmin authentication error:", error);
    res.status(401).json({
      success: false,
      message: "Access denied. Invalid token.",
    });
  }
};

export default authenticateSuperAdmin;
