import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export default async function verifyToken(req, res, next) {
  try {
    // 1. Check for header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token missing or wrong format in headers");
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);
    
    // Safety check: sometimes the string "undefined" or "null" gets sent
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "Invalid token string" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user and attach to request
    // Ensure your login controller signs the token with { id: user._id }
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User session expired or not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
}