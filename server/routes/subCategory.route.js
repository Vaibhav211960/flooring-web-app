import express from "express";
import {
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controller/subCategory.controller.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

// public
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.get("/category/:categoryId", getSubCategoriesByCategory);

// admin
router.post("/create", adminAuth, createSubCategory);
router.put("/:id", adminAuth, updateSubCategory);
router.delete("/:id", adminAuth, deleteSubCategory);

export default router;
