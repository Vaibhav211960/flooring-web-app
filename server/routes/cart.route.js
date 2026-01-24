import express from "express";
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controller/cart.controller.js";
import verifyToken from "../middleware/auth.middleware.js"; // Ensure you have your auth middleware

const router = express.Router();

// 1. Get user's specific cart
router.get("/", verifyToken, getMyCart);

// 2. Add item (or increase qty if exists)
router.post("/add", verifyToken, addToCart);

// 3. Update quantity of a specific product in the cart
// We use PUT /update and pass productId in the body (as seen in the controller)
router.put("/update", verifyToken, updateCartItem);

// 4. Remove a specific product from the cart array
// We pass the productId as a parameter
router.delete("/remove/:productId", verifyToken, removeFromCart);

// 5. Clear all items from the array
router.delete("/clear", verifyToken, clearCart);

export default router;