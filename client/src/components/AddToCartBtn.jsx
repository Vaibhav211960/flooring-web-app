import React, { useState } from "react";
import { Button } from "../ui/button";
import { useCart } from "../context/CartContext";
import { useToast } from "../hooks/useToast"; // Swapped Sonner for your custom hook
import { ShoppingCart, Check, Loader2 } from "lucide-react";

const AddToCartBtn = ({
  product,
  variant = "default",
  className = "",
  qty,
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { toast } = useToast(); // Using your classic toaster
  const [localLoading, setLocalLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents navigating to details if used inside a card

    const token = localStorage.getItem("UserToken");
    
    if (!token) {
      toast({
        title: "AUTHENTICATION REQUIRED",
        description: "Please login to save this to your collection.",
        className: "bg-stone-950 border border-red-900/50 text-white rounded-xl p-6",
      });
      return;
    }

    setLocalLoading(true);

    try {
      await addToCart(product, qty);

      toast({
        title: "CART ADDED",
        description: `${product.name} is now in your collection.`,
        className: "bg-stone-950 border border-stone-800 text-white rounded-xl p-6 shadow-2xl",
      });
    } catch (error) {
      console.error("Add to cart failed", error);
      toast({
        title: "SYSTEM ERROR",
        description: "Could not sync with your collection. Try again.",
        variant: "destructive",
        className: "bg-stone-950 border border-red-900/50 text-white rounded-xl p-6",
      });
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
          w-full flex items-center justify-center gap-2
          py-2.5 rounded-xl hover:scale-[1.02]
          text-[11px] font-bold uppercase tracking-widest
          bg-stone-900 text-white border-none
          transition-all duration-300
          disabled:opacity-60 disabled:cursor-not-allowed
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