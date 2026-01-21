import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        feedback: {
            type: String,
            required: true,
            maxlength: 255,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
