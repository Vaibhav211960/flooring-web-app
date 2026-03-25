import Order from "../model/order.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";
import User from "../model/user.model.js";
import mongoose from "mongoose";

const REPORT_TIMEZONE = "Asia/Kolkata";

const getReportDateRange = (from, to) => {
  const fromDate = from
    ? new Date(from)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);
  return { fromDate, toDate };
};

const getReportMatchStage = (from, to) => {
  const { fromDate, toDate } = getReportDateRange(from, to);
  return { $match: { createdAt: { $gte: fromDate, $lte: toDate } } };
};

const SAFE_SYSTEM_FIELDS = new Set(["_id", "createdAt", "updatedAt"]);

const getSchemaFieldPaths = (schema, prefix = "") => {
  const paths = [];
  Object.entries(schema.paths).forEach(([pathName, schemaType]) => {
    if (pathName === "__v") return;
    if (pathName.includes("$*")) return;

    const fullPath = prefix ? `${prefix}.${pathName}` : pathName;
    const options = schemaType?.options || {};
    const instance = schemaType?.instance || "Mixed";
    const enumValues = Array.isArray(options.enum) ? options.enum : undefined;

    paths.push({
      key: fullPath,
      label: fullPath,
      source: prefix || "root",
      type: instance.toLowerCase(),
      enumValues,
      required: !!options.required,
    });
  });

  return paths;
};

const REPORT_FIELD_DEFINITIONS = {
  revenue: [
    { key: "date", label: "Date", type: "date", source: "computed" },
    { key: "orderCount", label: "No. of Orders", type: "number", source: "computed" },
    { key: "revenue", label: "Revenue", type: "currency", source: "computed" },
    { key: "avgOrderValue", label: "Avg Order Value", type: "currency", source: "computed" },
  ],
  orders: [
    { key: "_id", label: "Order ID", type: "string", source: "order" },
    { key: "fullName", label: "Customer", type: "string", source: "order.shippingAddress.fullName" },
    { key: "contact", label: "Phone", type: "string", source: "order.shippingAddress.contact" },
    { key: "address", label: "Address", type: "string", source: "order.shippingAddress.address" },
    { key: "createdAt", label: "Order Date", type: "date", source: "order.createdAt" },
    { key: "paymentMode", label: "Payment Mode", type: "string", source: "order.paymentMode" },
    { key: "orderStatus", label: "Status", type: "string", source: "order.orderStatus" },
    { key: "itemCount", label: "Items", type: "number", source: "order.items" },
    { key: "netBill", label: "Amount", type: "currency", source: "order.netBill" },
  ],
  products: [
    { key: "productName", label: "Product Name", type: "string", source: "order.items.productName" },
    { key: "unitsSold", label: "Units Sold", type: "number", source: "order.items.units" },
    { key: "orderCount", label: "No. of Orders", type: "number", source: "computed" },
    { key: "totalRevenue", label: "Total Revenue", type: "currency", source: "order.items.totalAmount" },
  ],
  categories: [
    { key: "categoryName", label: "Sub-Category", type: "string", source: "product.subCategoryId -> subcategory.name" },
    { key: "unitsSold", label: "Units Sold", type: "number", source: "order.items.units" },
    { key: "orderCount", label: "No. of Orders", type: "number", source: "computed" },
    { key: "totalRevenue", label: "Revenue", type: "currency", source: "order.items.totalAmount" },
    { key: "percentOfTotal", label: "% of Total", type: "percent", source: "computed" },
  ],
  customers: [
    { key: "customerName", label: "Customer", type: "string", source: "user + order.shippingAddress.fullName" },
    { key: "email", label: "Email", type: "string", source: "user.email" },
    { key: "contact", label: "Phone", type: "string", source: "user.contact + order.shippingAddress.contact" },
    { key: "orderCount", label: "Orders", type: "number", source: "computed" },
    { key: "totalSpent", label: "Total Spent", type: "currency", source: "order.netBill" },
    { key: "avgOrderValue", label: "Avg Order", type: "currency", source: "computed" },
    { key: "lastOrderAt", label: "Last Order", type: "date", source: "order.createdAt" },
  ],
  payments: [
    { key: "paymentMode", label: "Payment Mode", type: "string", source: "order.paymentMode" },
    { key: "orderCount", label: "No. of Orders", type: "number", source: "computed" },
    { key: "totalRevenue", label: "Revenue", type: "currency", source: "order.netBill" },
    { key: "avgOrderValue", label: "Avg Order", type: "currency", source: "computed" },
    { key: "percentOfOrders", label: "% Orders", type: "percent", source: "computed" },
    { key: "percentOfRevenue", label: "% Revenue", type: "percent", source: "computed" },
  ],
  orderSize: [
    { key: "bucket", label: "Bucket", type: "string", source: "computed" },
    { key: "orderCount", label: "No. of Orders", type: "number", source: "computed" },
    { key: "totalItems", label: "Units Ordered", type: "number", source: "order.items.units" },
    { key: "totalRevenue", label: "Revenue", type: "currency", source: "order.netBill" },
    { key: "avgOrderValue", label: "Avg Order", type: "currency", source: "computed" },
  ],
};

const REPORT_DEFAULT_FIELDS = {
  revenue: ["date", "orderCount", "revenue", "avgOrderValue"],
  orders: ["_id", "fullName", "createdAt", "paymentMode", "orderStatus", "itemCount", "netBill"],
  products: ["productName", "unitsSold", "orderCount", "totalRevenue"],
  categories: ["categoryName", "unitsSold", "orderCount", "totalRevenue", "percentOfTotal"],
  customers: ["customerName", "email", "orderCount", "totalSpent", "avgOrderValue", "lastOrderAt"],
  payments: ["paymentMode", "orderCount", "totalRevenue", "avgOrderValue", "percentOfOrders", "percentOfRevenue"],
  orderSize: ["bucket", "orderCount", "totalItems", "totalRevenue", "avgOrderValue"],
};

const parseCsvFields = (value) =>
  String(value || "")
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);

const getSelectedFields = (query, reportKey) => {
  const allowed = new Set((REPORT_FIELD_DEFINITIONS[reportKey] || []).map((field) => field.key));
  const requested = parseCsvFields(query.fields).filter((field) => allowed.has(field));
  if (!requested.length) return REPORT_DEFAULT_FIELDS[reportKey] || [];
  return requested;
};

const toNumOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickRowFields = (rows, selectedFields) =>
  rows.map((row) =>
    selectedFields.reduce((acc, key) => {
      acc[key] = row?.[key];
      return acc;
    }, {})
  );

const getReportMetadata = () => {
  const orderFields = getSchemaFieldPaths(Order.schema, "order").filter((field) =>
    SAFE_SYSTEM_FIELDS.has(field.key.split(".").pop()) || field.key.startsWith("order.")
  );
  const userFields = getSchemaFieldPaths(User.schema, "user");
  const productFields = getSchemaFieldPaths(Product.schema, "product");
  const paymentFields = getSchemaFieldPaths(Payment.schema, "payment");

  return {
    schemaFields: { order: orderFields, user: userFields, product: productFields, payment: paymentFields },
    reports: {
      revenue: {
        title: "Revenue",
        fields: REPORT_FIELD_DEFINITIONS.revenue,
        defaultFields: REPORT_DEFAULT_FIELDS.revenue,
        filters: [
          { key: "minRevenue", label: "Revenue Min", type: "number" },
          { key: "maxRevenue", label: "Revenue Max", type: "number" },
          { key: "minOrders", label: "Orders Min", type: "number" },
          { key: "maxOrders", label: "Orders Max", type: "number" },
        ],
      },
      orders: {
        title: "Orders",
        fields: REPORT_FIELD_DEFINITIONS.orders,
        defaultFields: REPORT_DEFAULT_FIELDS.orders,
        filters: [
          { key: "orderId", label: "Order ID", type: "text" },
          { key: "customer", label: "Customer Name", type: "text" },
          { key: "status", label: "Order Status", type: "select", options: Order.schema.path("orderStatus")?.enumValues || [] },
          { key: "paymentMode", label: "Payment Method", type: "select", options: Order.schema.path("paymentMode")?.enumValues || [] },
          { key: "minAmount", label: "Order Value Min", type: "number" },
          { key: "maxAmount", label: "Order Value Max", type: "number" },
        ],
      },
      products: {
        title: "Best Products",
        fields: REPORT_FIELD_DEFINITIONS.products,
        defaultFields: REPORT_DEFAULT_FIELDS.products,
        filters: [
          { key: "product", label: "Product Name", type: "text" },
          { key: "minUnits", label: "Units Sold Min", type: "number" },
          { key: "maxUnits", label: "Units Sold Max", type: "number" },
          { key: "minRevenue", label: "Revenue Min", type: "number" },
          { key: "maxRevenue", label: "Revenue Max", type: "number" },
        ],
      },
      categories: {
        title: "By Category",
        fields: REPORT_FIELD_DEFINITIONS.categories,
        defaultFields: REPORT_DEFAULT_FIELDS.categories,
        filters: [
          { key: "categoryName", label: "Sub-Category", type: "text" },
          { key: "minUnits", label: "Units Sold Min", type: "number" },
          { key: "maxUnits", label: "Units Sold Max", type: "number" },
          { key: "minRevenue", label: "Revenue Min", type: "number" },
          { key: "maxRevenue", label: "Revenue Max", type: "number" },
        ],
      },
      customers: {
        title: "Customers",
        fields: REPORT_FIELD_DEFINITIONS.customers,
        defaultFields: REPORT_DEFAULT_FIELDS.customers,
        filters: [
          { key: "customer", label: "Customer Name", type: "text" },
          { key: "emailDomain", label: "Email Domain", type: "text" },
          { key: "repeatOnly", label: "Repeat Customers Only", type: "boolean" },
          { key: "minSpent", label: "Total Spend Min", type: "number" },
          { key: "maxSpent", label: "Total Spend Max", type: "number" },
          { key: "minOrders", label: "Orders Min", type: "number" },
        ],
      },
      payments: {
        title: "Payments",
        fields: REPORT_FIELD_DEFINITIONS.payments,
        defaultFields: REPORT_DEFAULT_FIELDS.payments,
        filters: [
          { key: "paymentMode", label: "Payment Method", type: "select", options: Order.schema.path("paymentMode")?.enumValues || [] },
          { key: "minRevenue", label: "Revenue Min", type: "number" },
          { key: "maxRevenue", label: "Revenue Max", type: "number" },
          { key: "minOrders", label: "Orders Min", type: "number" },
          { key: "minAvgOrder", label: "Avg Order Min", type: "number" },
        ],
      },
      orderSize: {
        title: "Order Size",
        fields: REPORT_FIELD_DEFINITIONS.orderSize,
        defaultFields: REPORT_DEFAULT_FIELDS.orderSize,
        filters: [
          { key: "bucket", label: "Bucket", type: "select", options: ["1 item", "2-3 items", "4-5 items", "6+ items"] },
          { key: "minItems", label: "Units Min", type: "number" },
          { key: "maxItems", label: "Units Max", type: "number" },
          { key: "minRevenue", label: "Revenue Min", type: "number" },
          { key: "minAvgOrder", label: "Avg Order Min", type: "number" },
        ],
      },
    },
  };
};

export const getReportConfig = async (_req, res) => {
  try {
    res.status(200).json({ success: true, ...getReportMetadata() });
  } catch (err) {
    console.error("[REPORT_CONFIG_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to load report configuration." });
  }
};

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
    const { fromDate, toDate } = getReportDateRange(from, to);
    const selectedFields = getSelectedFields(req.query, "revenue");
    const minRevenue = toNumOrNull(req.query.minRevenue);
    const maxRevenue = toNumOrNull(req.query.maxRevenue);
    const minOrders = toNumOrNull(req.query.minOrders);
    const maxOrders = toNumOrNull(req.query.maxOrders);

    const rowsRaw = await Order.aggregate([
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
          _id:        { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: REPORT_TIMEZONE } },
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
    const rowsFiltered = rowsRaw.filter((row) => {
      if (minRevenue !== null && row.revenue < minRevenue) return false;
      if (maxRevenue !== null && row.revenue > maxRevenue) return false;
      if (minOrders !== null && row.orderCount < minOrders) return false;
      if (maxOrders !== null && row.orderCount > maxOrders) return false;
      return true;
    });

    const totalRevenue  = rowsFiltered.reduce((s, r) => s + r.revenue, 0);
    const totalOrders   = rowsFiltered.reduce((s, r) => s + r.orderCount, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.status(200).json({
      success: true,
      summary: { totalRevenue, totalOrders, avgOrderValue },
      selectedFields,
      rows: pickRowFields(rowsFiltered, selectedFields),
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
    const { from, to, status, paymentMode, orderId, customer } = req.query;
    const matchStage = getReportMatchStage(from, to);
    const selectedFields = getSelectedFields(req.query, "orders");
    const minAmount = toNumOrNull(req.query.minAmount);
    const maxAmount = toNumOrNull(req.query.maxAmount);
    const minItems = toNumOrNull(req.query.minItems);
    const maxItems = toNumOrNull(req.query.maxItems);

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
    const filteredRows = orderRows.filter((row) => {
      if (orderId && !String(row._id || "").toLowerCase().includes(String(orderId).toLowerCase())) return false;
      if (customer && !String(row.fullName || "").toLowerCase().includes(String(customer).toLowerCase())) return false;
      if (status && row.orderStatus !== status) return false;
      if (paymentMode && row.paymentMode !== paymentMode) return false;
      if (minAmount !== null && row.netBill < minAmount) return false;
      if (maxAmount !== null && row.netBill > maxAmount) return false;
      if (minItems !== null && row.itemCount < minItems) return false;
      if (maxItems !== null && row.itemCount > maxItems) return false;
      return true;
    });

    const byStatus = { pending: 0, arriving: 0, delivered: 0, cancelled: 0 };
    if (!status && !paymentMode && !orderId && !customer && minAmount === null && maxAmount === null && minItems === null && maxItems === null) {
      statusRows.forEach((s) => { if (s._id in byStatus) byStatus[s._id] = s.count; });
    } else {
      filteredRows.forEach((row) => {
        if (row.orderStatus in byStatus) byStatus[row.orderStatus] += 1;
      });
    }

    res.status(200).json({
      success: true,
      total: filteredRows.length,
      byStatus,
      selectedFields,
      rows: pickRowFields(filteredRows, selectedFields),
    });
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
    const { from, to, limit = 20, product } = req.query;
    const { fromDate, toDate } = getReportDateRange(from, to);
    const selectedFields = getSelectedFields(req.query, "products");
    const minUnits = toNumOrNull(req.query.minUnits);
    const maxUnits = toNumOrNull(req.query.maxUnits);
    const minRevenue = toNumOrNull(req.query.minRevenue);
    const maxRevenue = toNumOrNull(req.query.maxRevenue);

    const rowsRaw = await Order.aggregate([
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

    const nameQuery = String(product || "").trim().toLowerCase();
    const rows = rowsRaw.filter((row) => {
      if (nameQuery && !String(row.productName || "").toLowerCase().includes(nameQuery)) return false;
      if (minUnits !== null && row.unitsSold < minUnits) return false;
      if (maxUnits !== null && row.unitsSold > maxUnits) return false;
      if (minRevenue !== null && row.totalRevenue < minRevenue) return false;
      if (maxRevenue !== null && row.totalRevenue > maxRevenue) return false;
      return true;
    });

    res.status(200).json({
      success: true,
      count: rows.length,
      selectedFields,
      rows: pickRowFields(rows, selectedFields),
    });
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
    const { from, to, categoryName } = req.query;
    const { fromDate, toDate } = getReportDateRange(from, to);
    const selectedFields = getSelectedFields(req.query, "categories");
    const minUnits = toNumOrNull(req.query.minUnits);
    const maxUnits = toNumOrNull(req.query.maxUnits);
    const minRevenue = toNumOrNull(req.query.minRevenue);
    const maxRevenue = toNumOrNull(req.query.maxRevenue);

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
    const grandTotal = rows.reduce((s, r) => s + r.totalRevenue, 0);
    const rowsWithPct = rows.map((r) => ({
      ...r,
      percentOfTotal: grandTotal > 0 ? parseFloat(((r.totalRevenue / grandTotal) * 100).toFixed(1)) : 0,
    }));
    const categoryQuery = String(categoryName || "").trim().toLowerCase();
    const rowsFiltered = rowsWithPct.filter((row) => {
      if (categoryQuery && !String(row.categoryName || "").toLowerCase().includes(categoryQuery)) return false;
      if (minUnits !== null && row.unitsSold < minUnits) return false;
      if (maxUnits !== null && row.unitsSold > maxUnits) return false;
      if (minRevenue !== null && row.totalRevenue < minRevenue) return false;
      if (maxRevenue !== null && row.totalRevenue > maxRevenue) return false;
      return true;
    });

    const filteredGrandTotal = rowsFiltered.reduce((sum, row) => sum + row.totalRevenue, 0);
    const normalizedRows = rowsFiltered.map((row) => ({
      ...row,
      percentOfTotal:
        filteredGrandTotal > 0
          ? parseFloat(((row.totalRevenue / filteredGrandTotal) * 100).toFixed(1))
          : 0,
    }));

    res.status(200).json({
      success: true,
      grandTotal: filteredGrandTotal,
      count: normalizedRows.length,
      selectedFields,
      rows: pickRowFields(normalizedRows, selectedFields),
    });
  } catch (err) {
    console.error("[CATEGORY_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate category report." });
  }
};

/**
 * ADMIN REPORT 5: Top customers
 *
 * Pipeline:
 *   $match -> $group by userId -> $lookup user -> $project -> $sort -> $limit
 *
 * Returns:
 *   summary: { totalCustomers, repeatCustomers, totalRevenue }
 *   rows: [ { userId, customerName, email, contact, orderCount, totalSpent, avgOrderValue, lastOrderAt } ]
 */
export const getTopCustomersReport = async (req, res) => {
  try {
    const { from, to, limit = 25, customer, emailDomain } = req.query;
    const matchStage = getReportMatchStage(from, to);
    const selectedFields = getSelectedFields(req.query, "customers");
    const minOrders = toNumOrNull(req.query.minOrders);
    const maxOrders = toNumOrNull(req.query.maxOrders);
    const minSpent = toNumOrNull(req.query.minSpent);
    const maxSpent = toNumOrNull(req.query.maxSpent);
    const repeatOnly = String(req.query.repeatOnly || "").toLowerCase() === "true";

    const customerGroupingStages = [
      matchStage,
      {
        $group: {
          _id: { $ifNull: ["$userId", null] },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$netBill" },
          lastOrderAt: { $max: "$createdAt" },
          customerName: { $first: "$shippingAddress.fullName" },
          contact: { $first: "$shippingAddress.contact" },
        },
      },
    ];

    const customerProjectionStages = [
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { fname: 1, lname: 1, userName: 1, email: 1, contact: 1 } }],
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          customerName: {
            $let: {
              vars: {
                fullName: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ["$user.fname", ""] },
                        " ",
                        { $ifNull: ["$user.lname", ""] },
                      ],
                    },
                  },
                },
              },
              in: {
                $ifNull: [
                  {
                    $cond: [
                      { $ne: ["$$fullName", ""] },
                      "$$fullName",
                      null,
                    ],
                  },
                  {
                    $ifNull: [
                      "$customerName",
                      { $ifNull: ["$user.userName", "Guest"] },
                    ],
                  },
                ],
              },
            },
          },
          email: { $ifNull: ["$user.email", ""] },
          contact: {
            $ifNull: [
              {
                $cond: [
                  { $gt: [{ $ifNull: ["$user.contact", 0] }, 0] },
                  { $toString: "$user.contact" },
                  null,
                ],
              },
              "$contact",
            ],
          },
          orderCount: 1,
          totalSpent: 1,
          avgOrderValue: {
            $cond: [
              { $gt: ["$orderCount", 0] },
              { $round: [{ $divide: ["$totalSpent", "$orderCount"] }, 0] },
              0,
            ],
          },
          lastOrderAt: 1,
        },
      },
    ];

    const [rowsRaw, summaryRows] = await Promise.all([
      Order.aggregate([
        ...customerGroupingStages,
        ...customerProjectionStages,
        { $sort: { totalSpent: -1, orderCount: -1, customerName: 1 } },
        { $limit: Number(limit) },
      ]),
      Order.aggregate([
        ...customerGroupingStages,
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 },
            repeatCustomers: {
              $sum: {
                $cond: [{ $gt: ["$orderCount", 1] }, 1, 0],
              },
            },
            totalRevenue: { $sum: "$totalSpent" },
          },
        },
        {
          $project: {
            _id: 0,
            totalCustomers: 1,
            repeatCustomers: 1,
            totalRevenue: 1,
          },
        },
      ]),
    ]);

    const nameQuery = String(customer || "").trim().toLowerCase();
    const domainQuery = String(emailDomain || "").trim().toLowerCase();
    const rows = rowsRaw.filter((row) => {
      if (nameQuery && !String(row.customerName || "").toLowerCase().includes(nameQuery)) return false;
      if (domainQuery && !String(row.email || "").toLowerCase().includes(`@${domainQuery.replace(/^@/, "")}`)) return false;
      if (repeatOnly && row.orderCount < 2) return false;
      if (minOrders !== null && row.orderCount < minOrders) return false;
      if (maxOrders !== null && row.orderCount > maxOrders) return false;
      if (minSpent !== null && row.totalSpent < minSpent) return false;
      if (maxSpent !== null && row.totalSpent > maxSpent) return false;
      return true;
    });

    const summary = summaryRows[0] || {
      totalCustomers: 0,
      repeatCustomers: 0,
      totalRevenue: 0,
    };

    const filteredSummary = {
      totalCustomers: rows.length,
      repeatCustomers: rows.filter((row) => row.orderCount > 1).length,
      totalRevenue: rows.reduce((sum, row) => sum + row.totalSpent, 0),
      baseTotalCustomers: summary.totalCustomers,
      baseRepeatCustomers: summary.repeatCustomers,
      baseTotalRevenue: summary.totalRevenue,
    };

    res.status(200).json({
      success: true,
      summary: filteredSummary,
      selectedFields,
      rows: pickRowFields(rows, selectedFields),
    });
  } catch (err) {
    console.error("[TOP_CUSTOMERS_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate customers report." });
  }
};

/**
 * ADMIN REPORT 6: Payment mode breakdown
 *
 * Pipeline:
 *   $match -> $group by paymentMode -> $project -> $sort
 *
 * Returns:
 *   summary: { totalOrders, totalRevenue }
 *   rows: [ { paymentMode, orderCount, totalRevenue, avgOrderValue, percentOfOrders, percentOfRevenue } ]
 */
export const getPaymentModeReport = async (req, res) => {
  try {
    const { from, to, paymentMode } = req.query;
    const matchStage = getReportMatchStage(from, to);
    const selectedFields = getSelectedFields(req.query, "payments");
    const minOrders = toNumOrNull(req.query.minOrders);
    const maxOrders = toNumOrNull(req.query.maxOrders);
    const minRevenue = toNumOrNull(req.query.minRevenue);
    const maxRevenue = toNumOrNull(req.query.maxRevenue);
    const minAvgOrder = toNumOrNull(req.query.minAvgOrder);

    const rowsRaw = await Order.aggregate([
      matchStage,
      {
        $group: {
          _id: { $ifNull: ["$paymentMode", "Unknown"] },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: "$netBill" },
        },
      },
      {
        $project: {
          _id: 0,
          paymentMode: "$_id",
          orderCount: 1,
          totalRevenue: 1,
          avgOrderValue: {
            $cond: [
              { $gt: ["$orderCount", 0] },
              { $round: [{ $divide: ["$totalRevenue", "$orderCount"] }, 0] },
              0,
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1, orderCount: -1, paymentMode: 1 } },
    ]);

    const modeQuery = String(paymentMode || "").trim().toLowerCase();
    const filteredRows = rowsRaw.filter((row) => {
      if (modeQuery && String(row.paymentMode || "").toLowerCase() !== modeQuery) return false;
      if (minOrders !== null && row.orderCount < minOrders) return false;
      if (maxOrders !== null && row.orderCount > maxOrders) return false;
      if (minRevenue !== null && row.totalRevenue < minRevenue) return false;
      if (maxRevenue !== null && row.totalRevenue > maxRevenue) return false;
      if (minAvgOrder !== null && row.avgOrderValue < minAvgOrder) return false;
      return true;
    });

    const totalOrders = filteredRows.reduce((sum, row) => sum + row.orderCount, 0);
    const totalRevenue = filteredRows.reduce((sum, row) => sum + row.totalRevenue, 0);

    const rowsWithShare = filteredRows.map((row) => ({
      ...row,
      percentOfOrders: totalOrders > 0 ? parseFloat(((row.orderCount / totalOrders) * 100).toFixed(1)) : 0,
      percentOfRevenue: totalRevenue > 0 ? parseFloat(((row.totalRevenue / totalRevenue) * 100).toFixed(1)) : 0,
    }));

    res.status(200).json({
      success: true,
      summary: { totalOrders, totalRevenue },
      selectedFields,
      rows: pickRowFields(rowsWithShare, selectedFields),
    });
  } catch (err) {
    console.error("[PAYMENT_MODE_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate payment mode report." });
  }
};

/**
 * ADMIN REPORT 7: Order size buckets
 *
 * Pipeline:
 *   $match -> $project itemCount + bucket -> $group -> $project -> $sort
 *
 * Returns:
 *   summary: { totalOrders, totalRevenue }
 *   rows: [ { bucket, orderCount, totalItems, totalRevenue, avgOrderValue } ]
 */
export const getOrderSizeReport = async (req, res) => {
  try {
    const { from, to, bucket } = req.query;
    const matchStage = getReportMatchStage(from, to);
    const selectedFields = getSelectedFields(req.query, "orderSize");
    const minOrders = toNumOrNull(req.query.minOrders);
    const maxOrders = toNumOrNull(req.query.maxOrders);
    const minItems = toNumOrNull(req.query.minItems);
    const maxItems = toNumOrNull(req.query.maxItems);
    const minRevenue = toNumOrNull(req.query.minRevenue);
    const maxRevenue = toNumOrNull(req.query.maxRevenue);

    const bucketSort = {
      "1 item": 1,
      "2-3 items": 2,
      "4-5 items": 3,
      "6+ items": 4,
    };

    const rows = await Order.aggregate([
      matchStage,
      {
        $project: {
          netBill: 1,
          itemCount: {
            $sum: {
              $map: {
                input: "$items",
                as: "item",
                in: { $ifNull: ["$$item.units", 0] },
              },
            },
          },
        },
      },
      {
        $project: {
          netBill: 1,
          itemCount: 1,
          bucket: {
            $switch: {
              branches: [
                { case: { $lte: ["$itemCount", 1] }, then: "1 item" },
                { case: { $lte: ["$itemCount", 3] }, then: "2-3 items" },
                { case: { $lte: ["$itemCount", 5] }, then: "4-5 items" },
              ],
              default: "6+ items",
            },
          },
        },
      },
      {
        $group: {
          _id: "$bucket",
          orderCount: { $sum: 1 },
          totalItems: { $sum: "$itemCount" },
          totalRevenue: { $sum: "$netBill" },
        },
      },
      {
        $project: {
          _id: 0,
          bucket: "$_id",
          orderCount: 1,
          totalItems: 1,
          totalRevenue: 1,
          avgOrderValue: {
            $cond: [
              { $gt: ["$orderCount", 0] },
              { $round: [{ $divide: ["$totalRevenue", "$orderCount"] }, 0] },
              0,
            ],
          },
        },
      },
    ]);

    const rowsWithSort = rows
      .map((row) => ({ ...row, sortOrder: bucketSort[row.bucket] ?? 99 }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ sortOrder, ...row }) => row);

    const bucketQuery = String(bucket || "").trim();
    const filteredRows = rowsWithSort.filter((row) => {
      if (bucketQuery && row.bucket !== bucketQuery) return false;
      if (minOrders !== null && row.orderCount < minOrders) return false;
      if (maxOrders !== null && row.orderCount > maxOrders) return false;
      if (minItems !== null && row.totalItems < minItems) return false;
      if (maxItems !== null && row.totalItems > maxItems) return false;
      if (minRevenue !== null && row.totalRevenue < minRevenue) return false;
      if (maxRevenue !== null && row.totalRevenue > maxRevenue) return false;
      return true;
    });

    const summary = {
      totalOrders: filteredRows.reduce((sum, row) => sum + row.orderCount, 0),
      totalRevenue: filteredRows.reduce((sum, row) => sum + row.totalRevenue, 0),
    };

    res.status(200).json({
      success: true,
      summary,
      selectedFields,
      rows: pickRowFields(filteredRows, selectedFields),
    });
  } catch (err) {
    console.error("[ORDER_SIZE_REPORT_ERROR]:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate order size report." });
  }
};
