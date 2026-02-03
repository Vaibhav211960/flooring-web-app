import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsBySubCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

// customer
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.get("/subcategory/:catId", getProductsBySubCategory);

// admin
router.post("/create", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
