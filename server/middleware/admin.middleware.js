import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";

const adminAuth = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // 3. Find admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired admin token",
    });
  }
};

export default adminAuth;
