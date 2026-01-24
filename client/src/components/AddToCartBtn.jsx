import React, { useState } from "react";
import { Button } from "../ui/button";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check, Loader2 } from "lucide-react";

const AddToCartBtn = ({
  product,
  variant = "default",
  className = "",
  qty = 1,
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    // Check if user is logged in (optional check here, but handled in context)
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("AUTHENTICATION REQUIRED", {
        description: "Please login to save this to your collection.",
        className: "bg-red-900 text-white border-none font-serif",
      });
      return;
    }

    setLocalLoading(true);

    try {
      // Calling the actual backend-synced function from your Context
      await addToCart(product, qty);

      toast.success("SPECIFICATION ADDED", {
        description: `${product.name} is now in your collection.`,
        className: "bg-stone-900 text-stone-50 border-stone-800 font-serif",
        action: {
          label: "VIEW CART",
          onClick: () => (window.location.href = "/cart"),
        },
      });
    } catch (error) {
      // Error handling is mostly in context, but we stop loading here
      console.error("Add to cart failed", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const itemInCart = isInCart(product._id);
  const quantityInCart = getItemQuantity(product._id);

  const baseStyles =
    "h-14 uppercase text-[10px] tracking-[0.2em] rounded-md transition-all duration-300 active:scale-[0.98]";

  const variants = {
    default: (
      <Button
        onClick={handleAddToCart}
        disabled={localLoading}
        className={`
    w-full
    flex items-center justify-center gap-2
    py-2.5
    rounded-xl
   hover:scale-105
    text-[11px]
    font-bold
    uppercase
    tracking-widest
    text-stone-700
    bg-stone-900
    text-white
    border-stone-900
    transition-all duration-300
    disabled:opacity-60
    disabled:cursor-not-allowed
    ${className}
  `}
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : itemInCart ? (
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Added ({quantityInCart})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Add to cart</span>
          </div>
        )}
      </Button>
    ),
    outline: (
      <Button
        onClick={handleAddToCart}
        disabled={localLoading}
        variant="outline"
        className={`${baseStyles} w-full border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-900 rounded-none ${className}`}
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-3 w-3" />
            <span>
              {itemInCart ? `In Collection (${quantityInCart})` : "Add to Cart"}
            </span>
          </div>
        )}
      </Button>
    ),
    icon: (
      <Button
        onClick={handleAddToCart}
        disabled={localLoading}
        size="icon"
        className="h-12 w-12 rounded-none bg-stone-900 text-white hover:bg-amber-800 transition-colors"
      >
        {localLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : itemInCart ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    ),
  };

  return variants[variant] || variants.default;
};

export default AddToCartBtn;
