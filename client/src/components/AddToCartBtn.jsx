import React, { useState } from "react";
import { Button } from "../ui/button";
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

  if (variant === "outline") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={localLoading}
        variant="outline"
        className={`w-full h-12 uppercase text-[10px] tracking-widest border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-900 rounded-xl transition-all ${className}`}
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{itemInCart ? `In Cart (${quantityInCart})` : "Add to Cart"}</span>
          </div>
        )}
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        onClick={handleAddToCart}
        disabled={localLoading}
        size="icon"
        className="h-11 w-11 rounded-xl bg-stone-900 text-white hover:bg-amber-700 transition-colors"
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : itemInCart ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // Default
  return (
    <Button
      onClick={handleAddToCart}
      disabled={localLoading}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-stone-900 text-white border-none hover:bg-stone-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {localLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : itemInCart ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Added ({quantityInCart})</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
};

export default AddToCartBtn;