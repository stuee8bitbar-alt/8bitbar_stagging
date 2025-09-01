import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateUser = async (req, res, next) => {
  try {
    const cookieToken = req.cookies.token;
    const headerToken = req.header("Authorization")?.replace("Bearer ", "");
    const token = cookieToken || headerToken;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (error) {
    console.error("User authentication error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authenticateUser;
