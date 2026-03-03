import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, unique: true, required: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },

    price: { type: Number, required: true }, 
    pricePerBox: { type: Number },
    unit: { 
      type: String, 
      enum: ["sqft", "box", "plank", "meter"], 
      default: "sqft" 
    },
    stock: { type: Number, required: true },

    // --- ADDED FOR CALCULATOR LOGIC ---
    coveragePerBox: { 
      type: Number, 
      required: true, 
      default: 1 // Crucial for your room area calculator
    },

    materialType: { type: String, required: true }, 
    woodType: { type: String },
    color: { type: String },
    
    // --- ADDED FOR SEARCH FILTERS ---
    colorFamily: { 
      type: String, 
      enum: ["Light", "Medium", "Dark", "Gray", "Natural", "White"] 
    },

    finish: { type: String },
    thicknessMM: { type: Number },
    lengthMM: { type: Number },
    widthMM: { type: Number },
    
    waterResistance: {
      type: String,
      enum: ["Waterproof", "Water-resistant", "Not-resistant"],
      default: "Not-resistant",
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);