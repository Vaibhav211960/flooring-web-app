import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api/cart";

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` },
  });

  const formatCartItems = (items) =>
    items.map((item) => {
      const prod = item.productId || {};
      const fallbackImage =
        "https://directflooringonline.co.uk/wp-content/uploads/2024/02/Habitat-Oak-Glue-Down-LVT-Flooring-Bedroom-1.jpg";

      return {
        cartItemId: item._id,
        _id:        prod._id || item._id,
        productId:  prod,
        name:       prod.name  || item.name  || "",
        image:      Array.isArray(prod.image)
                      ? (prod.image[0] || fallbackImage)
                      : (prod.image || item.image || fallbackImage),
        price:      item.price    ?? prod.price    ?? 0,
        quantity:   item.quantity ?? 10,
        total:      item.total    ?? (item.price ?? prod.price ?? 0) * (item.quantity ?? 1),
      };
    });

  const fetchCart = async () => {
    if (!localStorage.getItem("UserToken")) return;
    setIsLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, getAuthHeaders());
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
    } catch {
      // silent — user may not be logged in
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (product, quantity = 1) => {
    if (!localStorage.getItem("UserToken")) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/add`,
        { productId: product._id, quantity },
        getAuthHeaders()
      );
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
      toast.success(`${product.name} added to cart.`);
    } catch {
      toast.error("Failed to add item. Please try again.");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/remove/${productId}`,
        getAuthHeaders()
      );
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
      toast.success("Item removed from cart.");
    } catch {
      toast.error("Could not remove item.");
    }
  };

  // ── FIX: log errors so clearCart failures are visible during debugging ──
  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/clear`, getAuthHeaders());
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      console.error("clearCart failed:", err.response?.status, err.response?.data);
      toast.error("Could not clear cart.");
      throw err; // re-throw so Payment.jsx knows it failed
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    try {
      const res = await axios.put(
        `${API_BASE_URL}/update`,
        { productId, quantity },
        getAuthHeaders()
      );
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
    } catch {
      toast.error("Could not update quantity.");
    }
  };

  const getCartItemCount = () => cartItems.reduce((t, item) => t + item.quantity, 0);
  const isInCart         = (productId) => cartItems.some((item) => item._id === productId);
  const getItemQuantity  = (productId) => cartItems.find((item) => item._id === productId)?.quantity || 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        getCartTotal: () => cartTotal,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemCount,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};