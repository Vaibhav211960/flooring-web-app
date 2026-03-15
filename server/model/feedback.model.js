import mongoose from "mongoose";

// FIX: isApproved and isRejected fields were completely missing from the schema
// The admin controller's approve/reject functions would have saved nothing
// even if the routes existed — mongoose silently ignores unknown fields
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
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    images: [{ type: String }],

    // NEW: admin moderation fields
    // isApproved: true  = visible on the storefront
    // isRejected: true  = hidden, admin rejected it
    // both false        = pending — waiting for admin review
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews — one user per product
feedbackSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);