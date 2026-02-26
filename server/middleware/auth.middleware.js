import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export default async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "Malformed token" });
    }

    // 2. Verify token
    // If this fails, it jumps straight to the catch block
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
    // NOTE: Check if your login signed it as { id: ... } or { userId: ... }
    const user = await User.findById(decoded.id || decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user object to request
    req.user = user; 
    next();
  } catch (err) {
    console.error("JWT Error:", err.name, "-", err.message);
    
    // If token is expired, send a specific message
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    
    // Otherwise, it's an invalid token
    return res.status(401).json({ message: "Invalid token" });
  }
}