import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Loader2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartItemCount, clearCart, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getCartTotal();

  const discountData = useMemo(() => {
    if (subtotal >= 100000) return { p: 8, amt: subtotal * 0.08 };
    if (subtotal >= 50000) return { p: 5, amt: subtotal * 0.05 };
    return { p: 0, amt: 0 };
  }, [subtotal]);

  const deliveryCharge = subtotal >= 10000 || subtotal === 0 ? 0 : 499;
  const totalPayable = subtotal - discountData.amt + deliveryCharge;

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    const productsSnapshot = cartItems.map((item) => ({
      productId: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    }));
    localStorage.setItem("checkout_products", JSON.stringify(productsSnapshot));
    navigate("/buy-all");
    setIsCheckingOut(false);
  };

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag className="h-8 w-8 text-stone-300" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Your cart is empty</h1>
          <p className="text-stone-500 max-w-xs mb-8 text-sm">
            You haven't added any products yet.
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-12 rounded-xl uppercase tracking-widest text-[11px]"
          >
            Browse Products
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-stone-200 pb-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-amber-700 mb-4 transition-colors font-bold"
              >
                <ArrowLeft size={13} /> Continue Shopping
              </button>
              <h1 className="text-3xl font-serif font-bold text-stone-900">Your Cart</h1>
            </div>
            <div className="flex flex-col items-start md:items-end mt-2 md:mt-0">
              <p className="text-stone-500 text-sm">
                {getCartItemCount()} item{getCartItemCount() !== 1 ? "s" : ""}
              </p>
              {isLoading && (
                <span className="text-[10px] text-amber-600 animate-pulse uppercase tracking-wider mt-1">
                  Updating...
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Items */}
            <div className="lg:col-span-8 space-y-3">
              <div className="hidden md:grid grid-cols-12 px-5 mb-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}

              <div className="flex justify-end pt-2">
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 font-bold transition-colors"
                >
                  <Trash2 size={12} /> Clear Cart
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm sticky top-28">
                <h2 className="text-base font-bold text-stone-900 mb-5 border-b border-stone-100 pb-4 uppercase tracking-widest text-[11px]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discountData.p > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({discountData.p}%)</span>
                      <span>− ₹{discountData.amt.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery</span>
                    <span className="font-bold">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-4 mb-6 flex justify-between items-baseline">
                  <span className="font-bold text-stone-900 uppercase tracking-widest text-xs">Total</span>
                  <span className="text-2xl font-bold text-amber-800">
                    ₹{Math.round(totalPayable).toLocaleString("en-IN")}
                  </span>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  disabled={isCheckingOut || isLoading}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] disabled:opacity-60"
                >
                  {isCheckingOut ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                <div className="mt-6 space-y-2.5 border-t border-stone-100 pt-5">
                  <div className="flex items-center gap-2.5 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                    <ShieldCheck size={13} className="text-emerald-600" /> Secure Payment
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                    <Zap size={13} className="text-amber-600" /> Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;