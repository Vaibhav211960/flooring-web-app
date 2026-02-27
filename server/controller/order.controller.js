import Order from "../model/order.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js"; // Import your payment model
import mongoose from "mongoose";

/**
 * CUSTOMER: Place an order
 */

export const createOrder = async (req, res) => {
  try {
    const { items, netBill, paymentMode, shippingAddress, paymentMethod } = req.body;

    // FETCH USER ID SECURELY
    const userId = req.user._id; 

    if (!userId) {
      return res.status(401).json({ message: "User authentication failed" });
    }

    // ... (Stock check logic here) ...

    // 1. Create Payment first
    const newPayment = await Payment.create({
      paymentMode: paymentMethod, 
      amount: netBill,
      paymentStatus: paymentMode === "COD" ? "processing" : "confirmed",
      orderId: new mongoose.Types.ObjectId(), // Placeholder
    });

    // 2. Create Order with the SECURED userId
    const order = await Order.create({
      userId, // Now it's guaranteed!
      items,
      shippingAddress,
      netBill,
      paymentMode,
      paymentId: newPayment._id,
      orderStatus: "pending"
    });

    // 3. Link Payment to the real Order ID
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
    // Mongoose uses _id by default. 
    // Since req.user is a Mongoose document, .id is a virtual for ._id
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
      _id: req.params.id,
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
      _id: req.params.id,
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

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    // 1. Consider adding pagination via query params (e.g., ?page=1&limit=20)
  
    // 2. Execution with sorting and population
    const orders = await Order.find()
      .populate("userId", "name email") // Very helpful for admin dashboards
      .sort({ createdAt: -1 })

    // 3. Optional: Get total count for frontend pagination UI
    // const totalOrders = await Order.countDocuments();

    res.status(200).json({ 
      success: true,
      count: orders.length,
      orders 
    });
  } catch (err) {
    // 4. Improved logging
    console.error(`[ADMIN_ORDER_FETCH_ERROR]: ${err.stack}`);
    res.status(500).json({ 
      success: false, 
      message: "Server error: Unable to retrieve orders." 
    });
  }
  // res.status(200).json({ message: "Admin order retrieval endpoint - implementation pending" });
};

/**
 * ADMIN: Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate if the status is part of your Schema enum
    const validStatuses = ["pending", "arriving", "delivered", "cancel"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status update requested." 
      });
    }

    // 2. Update the order
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
      order: updatedOrder,
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

    // 1. Perform deletion
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Order record not found in registry." 
      });
    }

    // Optional: If you want to delete associated payments, do it here.

    res.status(200).json({
      success: true,
      message: "Order has been permanently purged from the registry.",
    });
  } catch (err) {
    console.error("DELETE_ORDER_ERROR:", err.message);
    res.status(500).json({ success: false, message: "Could not delete order." });
  }
};