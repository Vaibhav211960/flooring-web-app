import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    discountPerService: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    // ADD THIS SECTION:
    shippingAddress: {
      fullName: { type: String, required: true },
      contact: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
      landmark: { type: String }, // Optional
    },

    netBill: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "arriving", "delivered", "cancel"],
      default: "pending",
    },
    paymentMode: {
      type: String,
      enum: ["COD", "Net Banking", "UPI"],
      required: true,
    },
    paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment", // Links to your Payment model
    required: true
  },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
