import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Loader2, ShieldCheck, Zap, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── Shared Pricing Logic ────────────────────────────────────────────────────
// Discount: subtotal > ₹10,000 → 5% | > ₹5,000 → 2% | else 0%
export const getDiscountData = (subtotal) => {
  if (subtotal > 10000) return { p: 5, amt: subtotal * 0.05 };
  if (subtotal > 5000)  return { p: 2, amt: subtotal * 0.02 };
  return { p: 0, amt: 0 };
};

// Delivery: based on total quantity of tiles ordered
// < 50 units → ₹299 | 50–99 → ₹699 | ≥ 100 → ₹899 | empty cart → ₹0
export const getDeliveryCharge = (totalQty) => {
  if (totalQty === 0)   return 0;
  if (totalQty < 50)   return 299;
  if (totalQty < 100)  return 699;
  return 899;
};

// Upsell copy for discount tiers
export const getUpsellMessage = (subtotal) => {
  if (subtotal <= 0)    return null;
  if (subtotal < 5000)  return { text: `Add ₹${(5000 - subtotal).toLocaleString("en-IN")} more to unlock a 2% discount`, tier: "amber" };
  if (subtotal < 10000) return { text: `Add ₹${(10000 - subtotal).toLocaleString("en-IN")} more to unlock a 5% discount`, tier: "emerald" };
  return { text: "Maximum 5% volume discount applied!", tier: "emerald" };
};
// ─────────────────────────────────────────────────────────────────────────────

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartItemCount, clearCart, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal  = getCartTotal();
  const totalQty  = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const discountData    = useMemo(() => getDiscountData(subtotal),    [subtotal]);
  const deliveryCharge  = useMemo(() => getDeliveryCharge(totalQty),  [totalQty]);
  const totalPayable    = subtotal - discountData.amt + deliveryCharge;
  const upsell          = useMemo(() => getUpsellMessage(subtotal),   [subtotal]);

  const handleProceedToCheckout = () => {
    setIsCheckingOut(true);
    const productsSnapshot = cartItems.map((item) => ({
      productId: item._id,
      name:      item.name,
      image:     item.image,
      price:     item.price,
      quantity:  item.quantity,
      total:     item.total,
    }));
    localStorage.setItem("checkout_products", JSON.stringify(productsSnapshot));
    navigate("/buy-all");
    setIsCheckingOut(false);
  };

  // ── Loading ──
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

  // ── Empty ──
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag className="h-8 w-8 text-stone-300" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Your cart is empty</h1>
          <p className="text-stone-500 max-w-xs mb-8 text-sm leading-relaxed">
            You haven't added any products yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-12 rounded-xl uppercase tracking-widest text-[11px] font-bold transition-all active:scale-95"
          >
            Browse Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 hover:text-amber-500 mb-6 transition-colors font-bold"
          >
            <ArrowLeft size={13} /> Continue Shopping
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Review Order
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              Your <span className="italic text-amber-400">Cart</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-stone-400 text-sm">
                {getCartItemCount()} item{getCartItemCount() !== 1 ? "s" : ""}
              </span>
              {isLoading && (
                <span className="text-[10px] text-amber-500 animate-pulse uppercase tracking-wider">
                  Updating...
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Items */}
          <div className="lg:col-span-8 space-y-3">

            {/* Upsell Banner */}
            {upsell && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                upsell.tier === "emerald"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                  : "bg-amber-50 border-amber-100 text-amber-900"
              }`}>
                <Package size={13} className={upsell.tier === "emerald" ? "text-emerald-600 shrink-0" : "text-amber-600 shrink-0"} />
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]">{upsell.text}</p>
                <div className="h-1 flex-1 bg-stone-200/50 rounded-full overflow-hidden hidden sm:block ml-auto">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${upsell.tier === "emerald" ? "bg-emerald-400" : "bg-amber-400"}`}
                    style={{ width: `${Math.min((subtotal / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Column headers */}
            <div className="hidden md:grid grid-cols-12 px-5 mb-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}

            {/* Delivery info note */}
            <div className="flex items-center gap-2 pt-1 px-1">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                Delivery: ₹299 for &lt;50 units · ₹699 for 50–99 · ₹899 for 100+
              </p>
            </div>

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
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-5 pb-4 border-b border-stone-100">
                Order Summary
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountData.p > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({discountData.p}%)</span>
                    <span>− ₹{Math.round(discountData.amt).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>
                    Delivery
                    <span className="ml-1 text-[9px] text-stone-400 font-bold">({totalQty} units)</span>
                  </span>
                  <span className="font-bold text-stone-900">
                    {deliveryCharge === 0
                      ? <span className="text-emerald-600">Free</span>
                      : `₹${deliveryCharge}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mb-6 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Total</span>
                <span className="text-2xl font-bold text-amber-800">
                  ₹{Math.round(totalPayable).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={handleProceedToCheckout}
                disabled={isCheckingOut || isLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] disabled:opacity-60 transition-all active:scale-95"
              >
                {isCheckingOut ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Proceed to Checkout"}
              </button>

              <div className="mt-6 space-y-2.5 border-t border-stone-100 pt-5">
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                  <ShieldCheck size={13} className="text-emerald-600" /> Secure Payment
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                  <Zap size={13} className="text-amber-600" /> Fast Delivery
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