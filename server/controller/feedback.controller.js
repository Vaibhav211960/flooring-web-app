import Feedback from "../model/feedback.model.js";
import Order from "../model/order.model.js";
import mongoose from "mongoose";

/**
 * CUSTOMER: Verify if user can leave feedback for a product
 */
export const checkFeedbackEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const deliveredOrder = await Order.findOne({
      userId,
      orderStatus: "delivered",
      "items.productId": productObjectId,
    });

    if (!deliveredOrder) {
      return res.status(200).json({
        eligible: false,
        message: "You can only leave feedback after receiving a delivered order containing this product.",
      });
    }

    const existingFeedback = await Feedback.findOne({
      userId,
      productId: productObjectId,
    });

    res.status(200).json({
      eligible: !existingFeedback,
      message: existingFeedback
        ? "You have already submitted feedback for this product."
        : "Eligible to leave a review.",
    });
  } catch (err) {
    console.error("ELIGIBILITY_CHECK_ERROR:", err.message);
    res.status(500).json({ message: "Error checking eligibility" });
  }
};

/**
 * CUSTOMER: Submit Verified Feedback
 */
export const submitVerifiedFeedback = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    const userId = req.user._id;

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const verifiedOrder = await Order.findOne({
      userId,
      orderStatus: "delivered",
      "items.productId": productObjectId,
    });

    if (!verifiedOrder) {
      return res.status(403).json({
        message: "Unauthorized: A delivered purchase of this product is required to leave a review.",
      });
    }

    const newFeedback = await Feedback.create({
      productId: productObjectId,
      userId,
      orderId: verifiedOrder._id,
      rating,
      comment,
      images: images || [],
      // New reviews start as pending — admin must approve before they show on storefront
      isApproved: false,
      isRejected: false,
    });

    const populatedFeedback = await newFeedback.populate("userId", "userName");

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: populatedFeedback,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product." });
    }
    console.error("SUBMIT_FEEDBACK_ERROR:", err.message);
    res.status(500).json({ message: "Server error while submitting feedback" });
  }
};

/**
 * CUSTOMER: Edit own feedback
 */
export const editMyFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    if (feedback.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own reviews." });
    }

    feedback.rating  = rating  ?? feedback.rating;
    feedback.comment = comment ?? feedback.comment;

    // When a customer edits their review, reset to pending so admin re-moderates it
    feedback.isApproved = false;
    feedback.isRejected = false;

    await feedback.save();

    const populated = await feedback.populate("userId", "userName");

    res.status(200).json({
      message: "Feedback updated successfully.",
      feedback: populated,
    });
  } catch (err) {
    console.error("EDIT_FEEDBACK_ERROR:", err.message);
    res.status(500).json({ message: "Server error while updating feedback." });
  }
};

/**
 * CUSTOMER: Delete own feedback
 */
export const deleteMyFeedback = async (req, res) => {
  try {
    const { id }   = req.params;
    const userId   = req.user._id;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    if (feedback.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own reviews." });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (err) {
    console.error("DELETE_FEEDBACK_ERROR:", err.message);
    res.status(500).json({ message: "Server error while deleting feedback." });
  }
};

/**
 * CUSTOMER: Get logged-in user's feedback history
 */
export const getMyFeedbackHistory = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .populate("productId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUBLIC: Get all APPROVED reviews for a product
 * FIX: was returning ALL reviews — now only returns approved ones
 * so rejected/pending reviews never show on the storefront
 */
export const getProductReviews = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const feedbacks = await Feedback.find({
      productId,
      isApproved: true,   // only show approved reviews to customers
    })
      .populate("userId", "userName")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Get all platform feedback (all statuses)
 */
export const getAdminFeedbackLedger = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("userId", "userName email")
      .populate("productId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Approve a review — makes it visible on the storefront
 * FIX: this function was completely missing — frontend called PUT /feedback/admin/approve/:id
 * and got 404 every time because this route was never registered
 */
export const approveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isRejected: false },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({
      message: "Feedback approved and published.",
      feedback,
    });
  } catch (err) {
    console.error("APPROVE_FEEDBACK_ERROR:", err.message);
    res.status(500).json({ message: "Server error while approving feedback." });
  }
};

/**
 * ADMIN: Reject a review — hides it from the storefront
 * FIX: this function was completely missing — frontend called PUT /feedback/admin/reject/:id
 * and got 404 every time because this route was never registered
 */
export const rejectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isRejected: true, isApproved: false },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.status(200).json({
      message: "Feedback rejected and hidden.",
      feedback,
    });
  } catch (err) {
    console.error("REJECT_FEEDBACK_ERROR:", err.message);
    res.status(500).json({ message: "Server error while rejecting feedback." });
  }
};

/**
 * ADMIN: Delete a feedback entry permanently
 */
export const removeFeedback = async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found." });
    }
    res.status(200).json({ message: "Feedback removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};