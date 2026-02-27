import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true, // Links this review to a specific verified purchase
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: [String], // Array of URLs for customer photos
  },
  { timestamps: true }
);

// Prevent a user from leaving multiple reviews for the same product in the same order
feedbackSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);
