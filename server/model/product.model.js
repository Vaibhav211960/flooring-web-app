import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      // maxlength: 120,
    },

    stock: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      enum: ["sqft", "box", "plank"],
      default: "sqft",
    },

    woodType: {
      type: String,
      required: true,
    },

    finish: {
      type: String,
    },

    thicknessMM: {
      type: Number,
    },
    color: {
      type: String,
    },

    description: {
      type: String,
      required: true,
      // maxlength: 200,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    image: {
      type: String,
      required: true,
      // maxlength: 255,
    }, 
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
