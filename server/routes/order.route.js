import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrder,
  // ── 4 new report pipeline functions ──
  getRevenueReport,
  getOrdersSummary,
  getBestProducts,
  getCategoryReport,
  getTopCustomersReport,
  getPaymentModeReport,
  getOrderSizeReport,
  getReportConfig,
} from "../controller/order.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import adminAuth   from "../middleware/admin.middleware.js";

const router = express.Router();

// ── Customer routes ───────────────────────────────────────────────────────────
router.post("/place",          verifyToken, createOrder);
router.get("/my",         verifyToken, getMyOrders);
router.get("/:id",        verifyToken, getOrderById);
router.put("/cancel/:id", verifyToken, cancelOrder);

// ── Admin: order management ───────────────────────────────────────────────────
router.get("/admin/getAll",            getAllOrders);
router.get("/admin/user/:userId",      getOrdersByUserId);
router.put("/admin/update-status/:id", updateOrderStatus);
router.delete("/admin/delete/:id",     deleteOrder);

// ── Admin: report endpoints ───────────────────────────────────────────────────
// Each accepts ?from=YYYY-MM-DD&to=YYYY-MM-DD query params
// MongoDB aggregation pipelines run on the server — frontend receives tiny results
router.get("/admin/reports/revenue",    getRevenueReport);   // Revenue by date
router.get("/admin/reports/config",     getReportConfig);    // Dynamic fields + filters
router.get("/admin/reports/orders",     getOrdersSummary);   // Orders breakdown by status
router.get("/admin/reports/products",   getBestProducts);    // Best selling products
router.get("/admin/reports/categories", getCategoryReport);  // Category-wise sales
router.get("/admin/reports/customers",  getTopCustomersReport); // Top customers by spend
router.get("/admin/reports/payments",   getPaymentModeReport);  // Payment mode breakdown
router.get("/admin/reports/order-size", getOrderSizeReport);    // Order size buckets

export default router;
