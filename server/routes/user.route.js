import express from "express";
import User from "../model/user.model.js";
import { loginUser, registerUser } from "../controller/auth.controller.js";
import {
  getAllUsers,
  getUserById,
  updateMyProfile,
  getMyProfile,
  changePassword,
  blockUser,
  deleteUser,   // FIX: was imported in controller but never registered as a route
} from "../controller/user.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/login",  loginUser);
router.post("/signup", registerUser);

// ── Logged-in user (self) ─────────────────────────────────────────────────────
router.get("/me",                verifyToken, getMyProfile);
router.put("/me",                verifyToken, updateMyProfile);
router.put("/me/change-password",verifyToken, changePassword);

// ── Admin: user management ────────────────────────────────────────────────────
router.get("/getAllUsers",  getAllUsers);
router.get("/getUser/:id", getUserById);

// FIX 1: block route was PUT "/:id" which conflicted with everything
// Frontend was calling "/users/block/:id" but backend had no such route
// NEW: dedicated PUT /block/:id — clean and unambiguous
router.put("/block/:id", blockUser);

// FIX 2: DELETE route was completely missing from routes file
// deleteUser was imported in controller but never wired to any route
// Frontend's api.delete("/users/:id") was getting 404 every time
router.delete("/:id", deleteUser);

export default router;