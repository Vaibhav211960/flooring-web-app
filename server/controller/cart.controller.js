import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

/**
 * CUSTOMER: Get logged-in user's cart
 */
export const getMyCart = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id })
      .populate("productId", "productName productImg");

    res.status(200).json({ cartItems });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Add item to cart
 */
export const addToCart = async (req, res) => {
  try {
    const { userId,productId, productPrice, addToCartDetails, total } = req.body;

    if (!productId || !productPrice || !addToCartDetails || !total) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Optional: ensure product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cartItem = await Cart.create({
      userId,
      productId,
      productPrice,
      addToCartDetails,
      total,
    });

    res.status(201).json({
      message: "Item added to cart",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Update cart item
 */
export const updateCartItem = async (req, res) => {
  try {
    const { addToCartDetails, total } = req.body;

    const cartItem = await Cart.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { addToCartDetails, total },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      message: "Cart updated",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CUSTOMER: Clear cart
 */
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user.id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
