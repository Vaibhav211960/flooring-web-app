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

  const fetchCart = async () => {
    if (!token) return;
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
  }, [token]);

  const addToCart = async (product, quantity = 1) => {
    if (!token) {
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