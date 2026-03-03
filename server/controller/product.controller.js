import Product from "../model/product.model.js";
import SubCategory from "../model/subcategory.model.js";

/**
 * CUSTOMER: Get all active products
 */
export const getAllProducts = async (req, res) => {
  try {
    // 3. Fetch products with the new schema fields
    const products = await Product.find()
      .populate("subCategoryId", "name")
      .sort({ createdAt: -1 });

    // 4. Return success status with count (useful for admin dashboards)
    res.status(200).json({ 
      success: true,
      count: products.length,
      products 
    });
  } catch (err) {
    console.error("Fetch Products Error:", err.message);
    res.status(500).json({ message: "Server error while retrieving collections" });
  }
};

/**
 * CUSTOMER: Get product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the product
    // We remove the hard 'isActive' check here so Admins can still fetch it.
    // If you only want users to see active products, handle that in the Frontend 
    // or add a check: if (!product.isActive && req.user.role !== 'admin')
    const product = await Product.findById(id)
      .populate("subCategoryId", "name");

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "The specified material specification could not be found." 
      });
    }

    // 2. Bonus: Fetch Related Products (Real-world feature!)
    // This finds other products in the same category so the user can compare.
    const relatedProducts = await Product.find({
      subCategoryId: product.subCategoryId,
      _id: { $ne: id }, // Don't include the current product
      isActive: true
    }).limit(4);

    res.status(200).json({ 
      success: true,
      product,
      relatedProducts // Your frontend can now show "You might also like"
    });
  } catch (err) {
    console.error("Single Product Fetch Error:", err.message);
    res.status(500).json({ message: "Server error while retrieving product specs" });
  }
};

/**
 * CUSTOMER: Get products by subcategory
 */
export const getProductsBySubCategory = async (req, res) => {
  try {
    const { catId } = req.params;

    // 1. Basic Validation: Ensure catId exists
    if (!catId) {
      return res.status(400).json({ 
        success: false, 
        message: "Category ID is required to fetch collections." 
      });
    }

    // 2. Fetch Active Products with your New Schema fields
    // We filter by isActive so users don't see out-of-stock/archived items
    const products = await Product.find({ 
      subCategoryId: catId,
      isActive: true 
    })
    .sort({ createdAt: -1 });

    // 3. Return a clean industrial response
    res.status(200).json({ 
      success: true,
      count: products.length,
      products 
    });

  } catch (err) {
    console.error("Fetch Category Products Error:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Unable to retrieve the specified material category." 
    });
  }
};

/**
 * ADMIN: Create Product
 */
export const createProduct = async (req, res) => { 
  try {
    // 1. Destructure ALL fields from the new schema
    const {
      name,
      sku, // New
      description,
      image,
      price,
      pricePerBox, // New
      unit,
      stock,
      materialType, // New
      woodType,
      color,
      colorFamily, // New
      finish,
      thicknessMM,
      lengthMM,
      widthMM,
      waterResistance, // New
      subCategoryId,
      status,
    } = req.body;

    // Determine active status based on admin input
    const isActive = status === 'inactive' ? false : true;

    // 2. Strict Validation for REQUIRED fields
    // Note: Checking !== undefined for numbers allows stock/price to be 0
    if (
      !name || !sku || !description || !image || !materialType || !subCategoryId ||
      price === undefined || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing critical fields. Name, SKU, Price, Stock, Coverage Per Box, Material Type, SubCategory, Description, and Image are required." 
      });
    }

    // 3. Uniqueness Check (Check BOTH Name and SKU)
    const existingProduct = await Product.findOne({ 
      $or: [{ name: name }, { sku: sku }] 
    });
    
    if (existingProduct) {
      if (existingProduct.sku === sku) {
        return res.status(400).json({ success: false, message: "A product with this SKU already exists." });
      }
      return res.status(400).json({ success: false, message: "A product with this Name already exists." });
    }

    // 4. SubCategory Check
    const subCategoryExists = await SubCategory.findById(subCategoryId);
    if (!subCategoryExists) {
      return res.status(404).json({ success: false, message: "SubCategory not found in the registry." });
    }

    // 5. Create the Product
    const product = await Product.create({
      name,
      sku,
      description,
      image,
      price,
      pricePerBox,
      unit: unit || 'sqft', // Fallback to default if not provided
      stock,
      materialType,
      woodType,
      color,
      colorFamily,
      finish,
      thicknessMM,
      lengthMM,
      widthMM,
      waterResistance: waterResistance || 'Not-resistant',
      subCategoryId,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Material specification successfully added to inventory.",
      product,
    });

  } catch (err) {
    console.error("ADMIN_PRODUCT_CREATE_ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
/**
 * ADMIN: Update product
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1. Lock down unique fields (Prevent updating Name and SKU)
    delete updateData.name;
    delete updateData.sku;

    // 2. Handle the Active/Inactive toggle
    if (updateData.status !== undefined) {
      updateData.isActive = updateData.status !== 'inactive';
      delete updateData.status; // Remove this so it doesn't mess with the DB schema
    }

    // 3. Update the rest of the fields
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,           // Return the newly updated product
        runValidators: true  // Ensure valid data (like correct enums)
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Update Product Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ADMIN: Soft delete product
 */
export const deleteProduct = async (req, res) => {
  try {
    // We pass { isActive: false } as the second argument to disable it
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product disabled successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
