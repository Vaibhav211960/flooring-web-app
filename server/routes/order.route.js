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

const router = express.Router();

// customer
router.post("/create", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// admin
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
