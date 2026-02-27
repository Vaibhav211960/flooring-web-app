// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/user.route.js";
import cartRoutes from "./routes/cart.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";
import categoryRoutes from "./routes/category.route.js";
import subCategoryRoutes from "./routes/subCategory.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import paymentRoutes from "./routes/payment.route.js";
import dbConnection from "./db/db.js";

//admin routes
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Explicitly allow this!
}));
app.use(express.json());

dbConnection();
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/api/users", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/test", () => {
  console.log("hyy");
});

// Admin routes
app.use("/api/admin", adminRoutes);
// app.use("/api/admin/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

