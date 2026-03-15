import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controller/order.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

// ── Customer routes (no wildcard yet) ────────────────────────────────────────
router.post("/place",    verifyToken, createOrder);
router.get("/my",        verifyToken, getMyOrders);
router.put("/:id/cancel", verifyToken, cancelOrder);

// ── Admin routes — MUST come before "/:id" wildcard ──────────────────────────
// If these were after router.get("/:id"), Express would match "admin" as the
// :id param and never reach these handlers.
router.get("/admin/getAll",               getAllOrders);
router.put("/admin/update-status/:id",    adminAuth, updateOrderStatus);
router.delete("/admin/delete/:id",        adminAuth, deleteOrder);

// ── Wildcard route last — catches /:id only after all specific routes checked ─
router.get("/:id", verifyToken, getOrderById);

export default router;