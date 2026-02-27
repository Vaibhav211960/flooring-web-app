import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js";

/**
 * CUSTOMER: Create payment
 */
export const createPayment = async (req, res) => {
  try {
    const { paymentMode, amount, orderId, paymentStatus } = req.body;

    if (!paymentMode || !amount || !orderId || !paymentStatus) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      paymentMode,
      amount,
      orderId,
      paymentStatus,
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get logged-in user's payments
 */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "orderId",
        match: { userId: req.user.id },
        select: "netBill orderStatus",
      })
      .sort({ createdAt: -1 });

    // remove payments that don't belong to user
    const filteredPayments = payments.filter(p => p.orderId);

    res.status(200).json({ payments: filteredPayments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get payment by order
 */
export const getPaymentByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId })
      .populate("orderId", "netBill orderStatus");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// Controller for the Financial Ledger
export const getFinancialLedger = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'orderId',
                populate: {
                    path: 'userId', // References User model in Order schema
                    select: 'name email phone' // Only get what we need
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: "Sync Error", error });
    }
};

/**
 * ADMIN: Update payment status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment status updated",
      payment,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete payment
 */
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
