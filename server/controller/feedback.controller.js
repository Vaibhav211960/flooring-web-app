import Feedback from "../model/feedback.model.js";
import Product from "../model/product.model.js";

/**
 * CUSTOMER: Add feedback
 */
export const addFeedback = async (req, res) => {
  try {
    const { feedback, productId } = req.body;

    if (!feedback || !productId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newFeedback = await Feedback.create({
      feedback,
      productId,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get logged-in user's feedback
 */
export const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .populate("productId", "productName")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get feedback for a product
 */
export const getFeedbackByProduct = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      productId: req.params.productId,
    })
      .populate("userId", "userName")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all feedback
 */
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "userName email")
      .populate("productId", "productName")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete feedback
 */
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
