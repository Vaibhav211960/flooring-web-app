import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../hooks/useToast";

/* -------------------- CONTEXT SETUP -------------------- */

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/* -------------------- PROVIDER -------------------- */

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const token = localStorage.getItem("UserToken");
  const API_BASE_URL = "http://localhost:5000/api/cart";

  /* -------------------- THEME CONSTANTS -------------------- */
  // Consistent black theme styling for toasts
  const darkToastStyles = "bg-stone-950 text-stone-50 border border-stone-800 shadow-2xl font-serif";

  /* -------------------- HELPERS -------------------- */

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  const formatCartItems = (items) =>
    items.map((item) => ({
      _id: item.productId?._id,
      name: item.productId?.name,
      image: item.productId?.image,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    }));

  /* -------------------- ACTIONS -------------------- */

  const fetchCart = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, getAuthHeaders());
      setCartItems(formatCartItems(res.data.items));
      setCartTotal(res.data.cartTotal);
    } catch (error) {
      console.error("Vault Sync Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (product, quantity = 1) => {
    if (!token) {
      toast({
        title: "ACCESS DENIED",
        description: "Please login to curate your collection.",
        variant: "destructive",
        className: darkToastStyles,
      });
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
      
      toast({
        title: "COLLECTION UPDATED",
        description: `${product.name} added to vault.`,
        className: `${darkToastStyles} border-l-4 border-l-amber-600`,
      });
    } catch (error) {
      toast({
        title: "SYNC FAILED",
        description: "Unable to reach server. Check connection.",
        variant: "destructive",
        className: darkToastStyles,
      });
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
      
      toast({
        title: "MANIFEST UPDATED",
        description: "Item removed from collection.",
        className: darkToastStyles,
      });
    } catch (error) {
      toast({
        title: "ERROR",
        description: "Removal unsuccessful.",
        variant: "destructive",
        className: darkToastStyles,
      });
    }
  };

  const clearCart = async () => {
  try {
    await axios.delete(`${API_BASE_URL}/clear`, getAuthHeaders());
    setCartItems([]);
    setCartTotal(0);
  } catch (error) {
    console.error("Failed to clear vault", error);
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
    } catch (error) {
      toast({
        title: "UPDATE ERROR",
        description: "Quantity sync failed.",
        variant: "destructive",
        className: darkToastStyles,
      });
    }
  };

  /* -------------------- UTILS -------------------- */

  const getCartItemCount = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  const isInCart = (productId) => cartItems.some((item) => item._id === productId);
  const getItemQuantity = (productId) => cartItems.find((item) => item._id === productId)?.quantity || 0;

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