import SubCategory from "../model/subcategory.model.js";
import Category from "../model/category.model.js";

/**
 * CUSTOMER: Get all subcategories
 */
export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ subCategories });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get subcategory by ID
 */
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate("categoryId", "name");

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.status(200).json({ subCategory });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get subcategories by category
 */
export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subCategories = await SubCategory.find({ categoryId })
      .sort({ createdAt: -1 });

    res.status(200).json({ subCategories });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Create subcategory
 */
export const createSubCategory = async (req, res) => {
  console.log(req.body);
  try {

    const { categoryId, name, description, image , status } = req.body;

    const isActive = status === "active" ? true : false;

    if (!categoryId || !name || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category does not exist" });
    }

    const exists = await SubCategory.findOne({
      categoryId,
      name,

    });

    if (exists) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    const subCategory = await SubCategory.create({
      categoryId,
      name,
      description,
      image,
      isActive,
    });

    await subCategory.save();

    res.status(201).json({
      message: "SubCategory created successfully",
      subCategory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * ADMIN: Update subcategory
 */
export const updateSubCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;

    const isActive = status === "active" ? true : false;

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, description, image, isActive },
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    await subCategory.save();
    res.status(200).json({
      message: "SubCategory updated successfully",
      subCategory,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete subcategory
 */
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    res.status(200).json({
      message: "SubCategory deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
