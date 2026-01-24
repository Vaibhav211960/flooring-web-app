import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

/* -------------------- CONTEXT SETUP -------------------- */

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/* -------------------- PROVIDER -------------------- */

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_BASE_URL = "http://localhost:5000/api/cart";

  /* -------------------- HELPERS -------------------- */

  // Auth header for every request
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Convert backend cart items into UI-friendly format
  const formatCartItems = (items) =>
    items.map((item) => ({
      _id: item.productId?._id,
      name: item.productId?.productName,
      image: item.productId?.productImg,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    }));

  /* -------------------- FETCH CART -------------------- */

  const fetchCart = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, getAuthHeaders());
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
    } catch (error) {
      console.error("Error fetching cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  /* -------------------- ADD TO CART -------------------- */

  const addToCart = async (product, quantity = 1) => {
    if (!token) {
      toast.error("Please login to curate your collection");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/add`,
        { productId: product._id, quantity },
        getAuthHeaders()
      );

      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
      toast.success(`${product.name} added to collection`);
    } catch (error) {
      toast.error("Failed to sync with server");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- REMOVE FROM CART -------------------- */

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/remove/${productId}`,
        getAuthHeaders()
      );

      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
    } catch (error) {
      toast.error("Removal failed");
    }
  };

  /* -------------------- UPDATE QUANTITY -------------------- */

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
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  /* -------------------- UTIL FUNCTIONS -------------------- */

  const getCartItemCount = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  const isInCart = (productId) =>
    cartItems.some((item) => item._id === productId);

  const getItemQuantity = (productId) =>
    cartItems.find((item) => item._id === productId)?.quantity || 0;

  /* -------------------- PROVIDER VALUE -------------------- */

  return (
    <CartContext.Provider
      value={{
        cartItems,
        getCartTotal: () => cartTotal,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartItemCount,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
