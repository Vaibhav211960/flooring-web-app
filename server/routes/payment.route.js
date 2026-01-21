import express from "express";
import {
  createPayment,
  getMyPayments,
  getPaymentByOrder,
  getAllPayments,
  updatePaymentStatus,
  deletePayment,
} from "../controller/payment.controller.js";

const router = express.Router();

// customer
router.post("/", createPayment);
router.get("/my", getMyPayments);
router.get("/order/:orderId", getPaymentByOrder);

// admin
router.get("/", getAllPayments);
router.put("/:id/status", updatePaymentStatus);
router.delete("/:id", deletePayment);

export default router;
