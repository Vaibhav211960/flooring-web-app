import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrdersByUserId,   // NEW: was missing — needed for customer history modal
  updateOrderStatus,
  deleteOrder,
} from "../controller/order.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/", verifyToken, createOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/cancel/:id", verifyToken, cancelOrder);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get("/admin/getAll", adminAuth, getAllOrders);
// NEW: returns all orders placed by a specific user — used by customer history modal
router.get("/admin/user/:userId", adminAuth, getOrdersByUserId);
router.put("/admin/update-status/:id", adminAuth, updateOrderStatus);
router.delete("/admin/delete/:id", adminAuth, deleteOrder);

export default router;