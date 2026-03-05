import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet.jsx";
import { Button } from "../ui/button.jsx";
import { ShoppingCart, X } from "lucide-react";
import { ScrollArea } from "../ui/scrollArea.jsx";
import { useCart } from "../context/CartContext";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartItemCount, removeFromCart } =
    useCart();
  const cartTotal = getCartTotal();
  const itemCount = getCartItemCount();

  const handleViewCart = () => {
    setIsOpen(false);
    navigate("/cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5 text-stone-600" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader className="pb-4 border-b border-stone-100">
          <SheetTitle className="font-serif text-xl text-stone-900">
            Your Cart
          </SheetTitle>
          {itemCount > 0 && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 my-4 -mx-6 px-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-center">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-stone-300" />
              </div>
              <p className="text-stone-400 text-sm italic font-serif mb-4">
                Your cart is empty.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/products");
                }}
                className="text-amber-700 text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-4 py-2">
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-stone-100 bg-stone-50 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl">
                        🏠
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-serif font-semibold text-stone-900 text-sm line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-bold uppercase tracking-widest">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {cartItems.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                Total
              </span>
              <span className="font-serif text-xl font-bold text-stone-900">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <Button
              onClick={handleViewCart}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[11px]"
            >
              View Cart & Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}