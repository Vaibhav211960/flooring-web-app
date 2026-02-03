import Order from "../model/order.model.js";
import Product from "../model/product.model.js";

/**
 * CUSTOMER: Place an order
 */
export const createOrder = async (req, res) => {
  try {
    const { userId, items, netBill, paymentMode } = req.body;

    if (!items || items.length === 0 || !netBill || !paymentMode) {
      return res.status(400).json({ message: "Invalid order data" });
    }
    // Optional: reduce product stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productName}`,
        });
      }

      if (product.productQuantity < item.units) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productName}`,
        });
      }

      product.productQuantity -= item.units;
      await product.save();
    }

    const order = await Order.create({
      userId,
      items,
      netBill,
      paymentMode,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get logged-in user's orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
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
    const orders = await Order.find()
      .populate("userId", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete order
 */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
