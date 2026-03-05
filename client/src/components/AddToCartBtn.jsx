import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

const AddToCartBtn = ({ product, variant = "default", className = "", qty }) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("UserToken");
    if (!token) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, qty);
    } catch {
      toast.error("Could not add item. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const itemInCart = isInCart(product._id);
  const quantityInCart = getItemQuantity(product._id);

  /* ── Outline Variant ── */
  if (variant === "outline") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={localLoading}
        className={`w-full h-12 flex items-center justify-center gap-2 border border-stone-200 hover:border-stone-900 hover:bg-stone-50 text-stone-700 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 ${className}`}
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" />
            {itemInCart ? `In Cart (${quantityInCart})` : "Add to Cart"}
          </>
        )}
      </button>
    );
  }

  /* ── Icon Variant ── */
  if (variant === "icon") {
    return (
      <button
        onClick={handleAddToCart}
        disabled={localLoading}
        className="h-11 w-11 flex items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : itemInCart ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </button>
    );
  }

  /* ── Default Variant ── */
  return (
    <button
      onClick={handleAddToCart}
      disabled={localLoading}
      className={`w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-stone-900 text-white hover:bg-stone-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {localLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : itemInCart ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          Added ({quantityInCart})
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to Cart
        </>
      )}
    </button>
  );
};

export default AddToCartBtn;