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

// customer
router.post("/place", verifyToken, createOrder);
router.get("/my",verifyToken, getMyOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/cancel", verifyToken, cancelOrder);

// admin
router.get("/admin/getAll", getAllOrders);
router.put("/admin/update-status/:id", adminAuth, updateOrderStatus);
router.delete("/admin/delete/:id", adminAuth, deleteOrder);

export default router;
