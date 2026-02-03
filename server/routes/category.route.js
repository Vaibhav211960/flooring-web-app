import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controller/categories.controller.js";
import adminAuth from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/create", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
