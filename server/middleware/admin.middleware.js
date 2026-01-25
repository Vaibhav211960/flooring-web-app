import jwt from "jsonwebtoken";
import Admin from "../model/admin.model.js";
import dotenv from "dotenv";

dotenv.config();

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1].trim();
    console.log("TOKEN:", token);
    console.log("ADMIN_JWT_SECRET:", process.env.ADMIN_JWT_SECRET);

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    console.log("Decoded Admin Token:", decoded);

    // 4. Find admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // 5. Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error.message);
    return res.status(401).json({
      message: "Admin authentication failed",
    });
  }
};

export default adminAuth;
