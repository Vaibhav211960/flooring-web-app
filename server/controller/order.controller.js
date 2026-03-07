import Order from "../model/order.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";
import mongoose from "mongoose";

/**
 * CUSTOMER: Place an order
 * 
 * FIX: Never trust productName from the client — fetch it from the DB.
 * This prevents ValidationError when the client sends an empty/missing name.
 */
export const createOrder = async (req, res) => {
  try {
    const { items, netBill, paymentMode, shippingAddress, paymentMethod } = req.body;

    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "User authentication failed" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // ── Resolve product names from DB so we never depend on client-sent names ──
    const productIds = items.map((item) => item.productId).filter(Boolean);

    let productMap = {};
    if (productIds.length > 0) {
      const products = await Product.find(
        { _id: { $in: productIds } },
        "name price"                          // only fetch what we need
      );
      productMap = Object.fromEntries(
        products.map((p) => [p._id.toString(), p])
      );
    }

    // ── Build sanitized items, filling in name/price from DB if client omitted them ──
    const sanitizedItems = items.map((item) => {
      const productIdStr = item.productId?.toString();
      const dbProduct    = productMap[productIdStr];

      return {
        productId:    item.productId,
        productName:  dbProduct?.name       || item.productName  || item.name || "Product",
        pricePerUnit: dbProduct?.price      || item.pricePerUnit || item.price || 0,
        units:        item.units            || item.quantity     || 1,
        totalAmount:  item.totalAmount      || item.total
                      || (item.pricePerUnit || item.price || 0) * (item.units || item.quantity || 1),
      };
    });

    // 1. Create Payment first
    const newPayment = await Payment.create({
      paymentMode:   paymentMethod,
      amount:        netBill,
      paymentStatus: paymentMode === "COD" ? "processing" : "confirmed",
      orderId:       new mongoose.Types.ObjectId(), // placeholder, updated below
    });

    // 2. Create Order
    const order = await Order.create({
      userId,
      items:           sanitizedItems,
      shippingAddress,
      netBill,
      paymentMode,
      paymentId:       newPayment._id,
      orderStatus:     "pending",
    });

    // 3. Link payment to real order ID
    newPayment.orderId = order._id;
    await newPayment.save();

    res.status(201).json({ message: "Order placed successfully", order });

  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ message: "Server error during order placement" });
  }
};

/**
 * CUSTOMER: Get logged-in user's orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("Order Fetch Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get order details
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Cancel order (only if pending)
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id:    req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.orderStatus = "cancel";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   orders.length,
      orders,
    });
  } catch (err) {
    console.error(`[ADMIN_ORDER_FETCH_ERROR]: ${err.stack}`);
    res.status(500).json({
      success: false,
      message: "Server error: Unable to retrieve orders.",
    });
  }
};

/**
 * ADMIN: Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "arriving", "delivered", "cancel"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update requested.",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order:   updatedOrder,
    });
  } catch (err) {
    console.error("UPDATE_STATUS_ERROR:", err.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * ADMIN: Delete order
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order record not found in registry.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order has been permanently purged from the registry.",
    });
  } catch (err) {
    console.error("DELETE_ORDER_ERROR:", err.message);
    res.status(500).json({ success: false, message: "Could not delete order." });
  }
};