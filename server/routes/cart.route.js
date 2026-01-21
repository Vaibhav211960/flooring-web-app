import express from "express";
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controller/cart.controller.js";

const router = express.Router();

// all routes require authentication
router.get("/", getMyCart);
router.post("/create", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeFromCart);
router.delete("/clear", clearCart);

export default router;
