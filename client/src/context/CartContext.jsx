import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("UserToken");
  const API_BASE_URL = "http://localhost:5000/api/cart";

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` },
  });

  /**
   * Normalize a raw cart item from the API into a consistent shape.
   *
   * The backend returns items like:
   *   { _id: <cartRowId>, productId: { _id, name, image, price, ... }, price, quantity, total }
   *
   * We preserve BOTH ids so downstream pages can use them correctly:
   *   - cartItemId  → the cart-row _id  (used for remove/update operations)
   *   - _id         → the product _id   (used in order payloads)
   *   - productId   → full product object (kept so BuyAll resolver works)
   */
  const formatCartItems = (items) =>
    items.map((item) => {
      const prod = item.productId || {};
      const fallbackImage =
        "https://directflooringonline.co.uk/wp-content/uploads/2024/02/Habitat-Oak-Glue-Down-LVT-Flooring-Bedroom-1.jpg";

      return {
        // ── IDs ────────────────────────────────────────────────────────────
        cartItemId: item._id,            // cart-row id for remove/update API calls
        _id:        prod._id || item._id, // product id for order payloads

        // ── Keep the full productId object so BuyAll resolver can read it ─
        productId: prod,

        // ── Flat copies for convenient access ─────────────────────────────
        name:     prod.name  || item.name  || "",
        image:    Array.isArray(prod.image)
                    ? (prod.image[0] || fallbackImage)
                    : (prod.image || item.image || fallbackImage),
        price:    item.price    ?? prod.price    ?? 0,
        quantity: item.quantity ?? 1,
        total:    item.total    ?? (item.price ?? prod.price ?? 0) * (item.quantity ?? 1),
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

  useEffect(() => {
    fetchCart();
  }, []);                               // run once on mount; token read fresh in getAuthHeaders

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

  /**
   * removeFromCart accepts the PRODUCT id (item._id after formatting).
   * The API endpoint path uses it directly.
   */
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

  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/clear`, getAuthHeaders());
      setCartItems([]);
      setCartTotal(0);
    } catch {
      toast.error("Could not clear cart.");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
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

  const getCartItemCount  = () => cartItems.reduce((t, item) => t + item.quantity, 0);
  const isInCart          = (productId) => cartItems.some((item) => item._id === productId);
  const getItemQuantity   = (productId) => cartItems.find((item) => item._id === productId)?.quantity || 0;

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