import Category from "../model/category.model.js";

/**
 * CUSTOMER: Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Create new category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image , status } = req.body;

    const isActive = status === "inactive" ? false : true;
    if (!name || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
      image,
      isActive
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, image , status} = req.body;

    const isActive = status === "inactive" ? false : true;
    console.log(isActive);
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image , isActive },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
