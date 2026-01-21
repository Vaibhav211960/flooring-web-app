import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        paymentMode: {
            type: String,
            enum: ["card", "cod", "upi"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        paymentDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["complete", "pending", "failed"],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
