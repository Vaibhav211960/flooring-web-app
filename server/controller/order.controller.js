import Order from "../model/order.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";
import mongoose from "mongoose";

/** CUSTOMER: Place an order */
export const createOrder = async (req, res) => {
  try {
    const { items, netBill, paymentMode, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ message: "User authentication failed" });
    if (!items || items.length === 0) return res.status(400).json({ message: "No items in order" });

    const productIds = items.map((item) => item.productId).filter(Boolean);
    let productMap = {};
    if (productIds.length > 0) {
      const products = await Product.find({ _id: { $in: productIds } }, "name price");
      productMap = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    }

    const sanitizedItems = items.map((item) => {
      const dbProduct = productMap[item.productId?.toString()];
      return {
        productId:    item.productId,
        productName:  dbProduct?.name       || item.productName  || item.name || "Product",
        pricePerUnit: dbProduct?.price      || item.pricePerUnit || item.price || 0,
        units:        item.units            || item.quantity     || 1,
        totalAmount:  item.totalAmount      || item.total
                      || (item.pricePerUnit || item.price || 0) * (item.units || item.quantity || 1),
      };
    });

    const newPayment = await Payment.create({
      paymentMode: paymentMethod, amount: netBill,
      paymentStatus: paymentMode === "COD" ? "processing" : "confirmed",
      orderId: new mongoose.Types.ObjectId(),
    });

    const order = await Order.create({
      userId, items: sanitizedItems, shippingAddress,
      netBill, paymentMode, paymentId: newPayment._id, orderStatus: "pending",
    });

    newPayment.orderId = order._id;
    await newPayment.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Server error during order placement" });
  }
};

/** CUSTOMER: Get own orders */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch { res.status(500).json({ message: "Server error" }); }
};

/** CUSTOMER: Get single order */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ order });
  } catch { res.status(500).json({ message: "Server error" }); }
};

/** CUSTOMER: Cancel order */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus !== "pending")
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    order.orderStatus = "cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch { res.status(500).json({ message: "Server error" }); }
};

/** ADMIN: Get all orders */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: Unable to retrieve orders." });
  }
};

/** ADMIN: Get orders by user */
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: Unable to retrieve user orders." });
  }
};

/** ADMIN: Update order status / note */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const validStatuses = ["pending", "arriving", "delivered", "cancelled"];
    if (status && !validStatuses.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    const updateFields = {};
    if (status)                  updateFields.orderStatus = status;
    if (adminNote !== undefined) updateFields.adminNote   = adminNote;
    if (!Object.keys(updateFields).length)
      return res.status(400).json({ success: false, message: "No fields to update." });
    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    if (!updatedOrder) return res.status(404).json({ success: false, message: "Order not found." });
    res.status(200).json({ success: true, message: status ? `Order status updated to ${status}` : "Order updated.", order: updatedOrder });
  } catch (err) {
    console.log(err);
    
    res.status(500).json({ success: false, message: "Internal server error." });

  }
};

/** ADMIN: Delete order */
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder)
      return res.status(404).json({ success: false, message: "Order record not found." });
    res.status(200).json({ success: true, message: "Order permanently deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete order." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN REPORT PIPELINES
//
// Core concept: MongoDB Aggregation Pipeline
// Each stage transforms the data and passes results to the next stage.
// The DB does all the heavy lifting — Node/frontend receive tiny pre-computed results.
//
// Why this matters:
//   Old way → fetch 500 raw orders to browser → browser loops & calculates → slow
//   New way → MongoDB processes 500 orders → sends 7 rows (one per day) → fast always
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ADMIN REPORT 1: Revenue by date
 *
 * Pipeline stages:
 *   $match  → filter to date range (reduces dataset early — most important stage)
 *   $group  → group all orders on same day into one document, sum netBill
 *   $project → rename fields, calculate avgOrderValue
 *   $sort   → date ascending
 *
 * Returns:
 *   summary: { totalRevenue, totalOrders, avgOrderValue }
 *   rows:    [ { date, orderCount, revenue, avgOrderValue } ]
 */
export const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate   = to   ? new Date(to)   : new Date();
    toDate.setHours(23, 59, 59, 999);

    const rows = await Order.aggregate([
      // ── Stage 1: $match ──────────────────────────────────────────────────
      // Always put $match FIRST — it reduces the number of docs all later
      // stages have to process. MongoDB can use indexes on createdAt here.
      {
        $match: { createdAt: { $gte: fromDate, $lte: toDate } },
      },

      // ── Stage 2: $group ──────────────────────────────────────────────────
      // _id becomes the group key — here it's the date string "YYYY-MM-DD"
      // $dateToString converts the Date object to a readable string
      // timezone: "Asia/Kolkata" ensures dates are in IST not UTC
      {
        $group: {
          _id:        { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          orderCount: { $sum: 1 },
          revenue:    { $sum: "$netBill" },
        },
      },

      // ── Stage 3: $project ────────────────────────────────────────────────
      // Reshape the output: rename _id to date, add calculated avgOrderValue
      // $cond prevents division by zero
      {
        $project: {
          _id:           0,
          date:          "$_id",
          orderCount:    1,
          revenue:       1,
          avgOrderValue: {
            $cond: [
              { $gt: ["$orderCount", 0] },
              { $round: [{ $divide: ["$revenue", "$orderCount"] }, 0] },
              0,
            ],
          },
        },
      },

      // ── Stage 4: $sort ───────────────────────────────────────────────────
      { $sort: { date: 1 } },
    ]);

    // Summary totals — just summing the already-aggregated rows (~30 items max)
    const totalRevenue  = rows.reduce((s, r) => s + r.revenue, 0);
    const totalOrders   = rows.reduce((s, r) => s + r.orderCount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      summary: { totalRevenue, totalOrders, avgOrderValue },
      rows,
    });
  } catch (err) {
    console.error("[REVENUE_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate revenue report." });
  }
};

/**
 * ADMIN REPORT 2: Orders summary
 *
 * Runs TWO pipelines in parallel via Promise.all:
 *   Pipeline A → group by orderStatus → count each status
 *   Pipeline B → $project only needed columns → no unused data sent over wire
 *
 * Returns:
 *   byStatus: { pending: 5, arriving: 3, delivered: 12, cancelled: 1 }
 *   rows:     [ { _id, fullName, contact, address, orderStatus, paymentMode, netBill, itemCount, createdAt } ]
 */
export const getOrdersSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate   = to   ? new Date(to)   : new Date();
    toDate.setHours(23, 59, 59, 999);

    const matchStage = { $match: { createdAt: { $gte: fromDate, $lte: toDate } } };

    const [statusRows, orderRows] = await Promise.all([
      // Pipeline A: status breakdown
      Order.aggregate([
        matchStage,
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),

      // Pipeline B: order list — $project picks ONLY columns the report needs
      // This is the "specific columns" principle your mentor mentioned:
      // Don't send items[], shippingAddress nested object, paymentId etc.
      // Only send what will actually be displayed or exported
      Order.aggregate([
        matchStage,
        {
          $project: {
            _id:         1,
            orderStatus: 1,
            paymentMode: 1,
            netBill:     1,
            createdAt:   1,
            // $size counts the array length in the DB — no need to send the full array
            itemCount:   { $size: "$items" },
            // Flatten nested shippingAddress fields to top level
            fullName:    "$shippingAddress.fullName",
            contact:     "$shippingAddress.contact",
            address:     "$shippingAddress.address",
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    // Convert [{_id: "pending", count: 5}] → {pending: 5, arriving: 0, ...}
    const byStatus = { pending: 0, arriving: 0, delivered: 0, cancelled: 0 };
    statusRows.forEach((s) => { if (s._id in byStatus) byStatus[s._id] = s.count; });

    res.status(200).json({ success: true, total: orderRows.length, byStatus, rows: orderRows });
  } catch (err) {
    console.error("[ORDERS_SUMMARY_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate orders summary." });
  }
};

/**
 * ADMIN REPORT 3: Best selling products
 *
 * Key stage: $unwind
 *   Before $unwind: one order document with items: [{A}, {B}, {C}]
 *   After  $unwind: three separate documents, one per item
 *   Now we can $group by items.productId across ALL orders from ALL customers
 *
 * Pipeline:
 *   $match → $unwind items → $group by productId → $project → $sort → $limit
 *
 * Returns: [ { productId, productName, unitsSold, orderCount, totalRevenue } ]
 */
export const getBestProducts = async (req, res) => {
  try {
    const { from, to, limit = 20 } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate   = to   ? new Date(to)   : new Date();
    toDate.setHours(23, 59, 59, 999);

    const rows = await Order.aggregate([
      // Stage 1: Date filter
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },

      // Stage 2: $unwind — explode items array into individual documents
      // This is what enables grouping by product across all orders
      { $unwind: "$items" },

      // Stage 3: $group by productId — aggregate across all orders
      {
        $group: {
          _id:          "$items.productId",
          productName:  { $first: "$items.productName" }, // same product → same name
          unitsSold:    { $sum: "$items.units" },
          totalRevenue: { $sum: "$items.totalAmount" },
          orderCount:   { $sum: 1 },
        },
      },

      // Stage 4: $project — clean output shape
      {
        $project: {
          _id:          0,
          productId:    "$_id",
          productName:  1,
          unitsSold:    1,
          totalRevenue: 1,
          orderCount:   1,
        },
      },

      // Stage 5: Sort best sellers first
      { $sort: { unitsSold: -1 } },

      // Stage 6: Limit — no need to send hundreds of products
      { $limit: Number(limit) },
    ]);

    res.status(200).json({ success: true, count: rows.length, rows });
  } catch (err) {
    console.error("[BEST_PRODUCTS_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate products report." });
  }
};

/**
 * ADMIN REPORT 4: Category-wise sales breakdown
 *
 * Key stages: $lookup (MongoDB JOIN)
 *   $lookup joins orders.items.productId → products._id → gets subCategoryId
 *   $lookup joins product.subCategoryId → subcategories._id → gets category name
 *
 * This is exactly what your mentor described — using the pipeline to pull
 * specific columns from related collections, not fetching everything separately
 *
 * Pipeline:
 *   $match → $unwind → $lookup Product → $unwind → $lookup SubCategory → $unwind → $group → $sort
 *
 * Returns: [ { categoryName, unitsSold, orderCount, totalRevenue, percentOfTotal } ]
 */
export const getCategoryReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate   = to   ? new Date(to)   : new Date();
    toDate.setHours(23, 59, 59, 999);

    const rows = await Order.aggregate([
      // Stage 1: Date filter
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },

      // Stage 2: Unwind items
      { $unwind: "$items" },

      // Stage 3: $lookup — JOIN with products collection
      // Finds the product document for each order item
      // from: "products" — the MongoDB collection name (lowercase plural of model name)
      {
        $lookup: {
          from:         "products",
          localField:   "items.productId",     // field in current pipeline doc
          foreignField: "_id",                 // field in products collection
          as:           "product",             // result stored in this array field
          // pipeline inside lookup to select ONLY subCategoryId — don't fetch whole product
          pipeline: [{ $project: { subCategoryId: 1 } }],
        },
      },

      // Stage 4: Unwind product (lookup returns array, we want single doc)
      // preserveNullAndEmptyArrays: true — keep items whose product was deleted
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // Stage 5: $lookup — JOIN with subcategories collection
      {
        $lookup: {
          from:         "subcategories",
          localField:   "product.subCategoryId",
          foreignField: "_id",
          as:           "subCategory",
          // Only fetch the name field from subcategory — nothing else needed
          pipeline: [{ $project: { name: 1 } }],
        },
      },

      { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },

      // Stage 6: Group by category name — sum units and revenue
      {
        $group: {
          _id:          { $ifNull: ["$subCategory.name", "Uncategorised"] },
          unitsSold:    { $sum: "$items.units" },
          totalRevenue: { $sum: "$items.totalAmount" },
          orderCount:   { $sum: 1 },
        },
      },

      // Stage 7: Reshape
      {
        $project: {
          _id:          0,
          categoryName: "$_id",
          unitsSold:    1,
          totalRevenue: 1,
          orderCount:   1,
        },
      },

      // Stage 8: Sort by revenue descending
      { $sort: { totalRevenue: -1 } },
    ]);

    // Calculate % of total — done in Node on ~10 rows, not worth a DB stage
    const grandTotal   = rows.reduce((s, r) => s + r.totalRevenue, 0);
    const rowsWithPct  = rows.map((r) => ({
      ...r,
      percentOfTotal: grandTotal > 0 ? parseFloat(((r.totalRevenue / grandTotal) * 100).toFixed(1)) : 0,
    }));

    res.status(200).json({ success: true, grandTotal, count: rowsWithPct.length, rows: rowsWithPct });
  } catch (err) {
    console.error("[CATEGORY_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate category report." });
  }
};