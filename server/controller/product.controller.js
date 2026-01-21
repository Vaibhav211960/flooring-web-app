import Product from "../model/product.model.js";
import SubCategory from "../model/subcategory.model.js";

/**
 * CUSTOMER: Get all active products
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("subCategoryId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("subCategoryId", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Get products by subcategory
 */
export const getProductsBySubCategory = async (req, res) => {
  // console.log("hhh");
  
  // console.log(catId);
  try {
    const { catId } = req.params;

    const products = await Product.find({ subCategoryId: catId }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ err: "hvcnvvv" });
  }
};

/**
 * CUSTOMER: Search products
 */
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
      isActive: true,
    });

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN: Create product
 */
export const createProduct = async (req, res) => {
  console.log(req.body);
  
  try {
    const {
      name,
      stock,
      price,
      description,
      subCategoryId,
      image,
      unit,
      woodType,
      finish,
      thicknessMM,
      color,
      status,
    } = req.body;

    // stock = Number(stock);
    // price = Number(price);
    // thicknessMM = Number(thicknessMM);
    const isActive = status === 'inactive' ? false : true;
    if (
      !name ||
      !stock ||
      !price ||
      !description ||
      !subCategoryId ||
      !image
    ) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this name already exists" });
    }

    const subCategoryExists = await SubCategory.findById(subCategoryId);
    if (!subCategoryExists) {
      return res.status(404).json({ message: "SubCategory not found" });
    }

    const product = await Product.create({
      name,
      stock,
      price,
      description,
      subCategoryId,
      image,
      unit,
      woodType,
      finish,
      thicknessMM,
      color,
      isActive,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * ADMIN: Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ADMIN: Soft delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product disabled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
