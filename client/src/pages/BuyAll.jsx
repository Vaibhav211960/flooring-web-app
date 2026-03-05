import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon, ChevronRight, Truck, ShieldCheck,
  Package, Loader2, ShoppingBag, Gift,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useToast } from "../hooks/useToast";
import { getDiscountData, getDeliveryCharge } from "../pages/Cart";

export default function BuyAll() {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const { cartItems, getCartTotal, isLoading } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("temp_shipping_address");
    return saved ? JSON.parse(saved) : {
      fullName: "", contact: "", pincode: "", landmark: "", address: "",
    };
  });
  const [errors, setErrors] = useState({});

  // Persist address as user types
  useEffect(() => {
    localStorage.setItem("temp_shipping_address", JSON.stringify(form));
  }, [form]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) navigate("/cart");
  }, [cartItems, isLoading, navigate]);

  // ── Financials (shared logic) ──────────────────────────────────────────────
  const subtotal    = getCartTotal();
  const totalQty    = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const discountData   = useMemo(() => getDiscountData(subtotal),   [subtotal]);
  const deliveryCharge = useMemo(() => getDeliveryCharge(totalQty), [totalQty]);
  const totalPayable   = subtotal - discountData.amt + deliveryCharge;

  const upsellMessage = useMemo(() => {
    if (subtotal <= 0)    return null;
    if (subtotal < 5000)  return {
      text:  `Add ₹${(5000 - subtotal).toLocaleString("en-IN")} more to unlock a 2% discount`,
      icon:  <Gift size={13} className="text-amber-600 shrink-0" />,
      color: "bg-amber-50 border-amber-100 text-amber-900",
      bar:   "bg-amber-400",
    };
    if (subtotal < 10000) return {
      text:  `Add ₹${(10000 - subtotal).toLocaleString("en-IN")} more to unlock a 5% discount`,
      icon:  <Package size={13} className="text-emerald-600 shrink-0" />,
      color: "bg-emerald-50 border-emerald-100 text-emerald-900",
      bar:   "bg-emerald-400",
    };
    return {
      text:  "Maximum 5% volume discount applied!",
      icon:  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />,
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
      bar:   "bg-emerald-400",
    };
  }, [subtotal]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handlePlaceOrder = async () => {
    const newErrors = {};
    if (!form.fullName.trim())           newErrors.fullName = "Full name required";
    if (!/^\d{10}$/.test(form.contact))  newErrors.contact  = "Invalid 10-digit contact";
    if (!/^\d{6}$/.test(form.pincode))   newErrors.pincode  = "Invalid pincode";
    if (form.address.length < 10)        newErrors.address  = "Address too short";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Incomplete Details", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setIsPlacingOrder(true);
    setTimeout(() => {
      toast({ title: "Address Saved", description: `Reference: FLR-${Math.floor(Math.random() * 90000)}` });
      navigate("/checkout/payment", { state: { items: cartItems, form, netBill: totalPayable } });
      setIsPlacingOrder(false);
    }, 1500);
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Checkout</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Secure Checkout
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Review & <span className="italic text-amber-400">Dispatch</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          <div className="lg:col-span-8 space-y-6">

            {/* Upsell Banner */}
            {upsellMessage && (
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${upsellMessage.color}`}>
                {upsellMessage.icon}
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]">{upsellMessage.text}</p>
                <div className="h-1 flex-1 bg-stone-200/50 rounded-full overflow-hidden hidden sm:block ml-auto">
                  <div
                    className={`h-full ${upsellMessage.bar} transition-all duration-700 rounded-full`}
                    style={{ width: `${Math.min((subtotal / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
                <ShoppingBag className="text-stone-400" size={16} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Order Items ({cartItems.length})
                </p>
              </div>
              <div className="divide-y divide-stone-50 max-h-[380px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-5 flex items-center gap-5">
                    <img
                      src={item.productId?.image || item.image}
                      alt="product"
                      className="w-14 h-14 object-cover rounded-xl border border-stone-100 bg-stone-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-stone-800 truncate">
                        {item.productId?.name || item.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-sm text-stone-900 shrink-0">
                      ₹{((item.productId?.price || item.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Form */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
                <Truck className="text-stone-400" size={16} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Shipping Address
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Full Name"       name="fullName" value={form.fullName} onChange={handleInput} error={errors.fullName} />
                <InputField label="Contact Number"  name="contact"  value={form.contact}  onChange={handleInput} error={errors.contact} placeholder="+91" />
                <InputField label="Pincode"         name="pincode"  value={form.pincode}  onChange={handleInput} error={errors.pincode} />
                <InputField label="Landmark"        name="landmark" value={form.landmark} onChange={handleInput} placeholder="Optional" />
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    value={form.address}
                    onChange={handleInput}
                    className={`w-full rounded-xl border p-4 text-sm bg-stone-50 outline-none transition-all resize-none ${
                      errors.address ? "border-red-400" : "border-stone-200 focus:border-amber-500"
                    }`}
                    placeholder="Site / delivery address..."
                  />
                  {errors.address && (
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">! {errors.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sticky top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-5 pb-4 border-b border-stone-100">
                Financial Summary
              </p>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-stone-900">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountData.p > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Volume Discount ({discountData.p}%)</span>
                    <span className="font-mono">− ₹{Math.round(discountData.amt).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>
                    Delivery
                    <span className="ml-1 text-[9px] text-stone-400 font-bold">({totalQty} units)</span>
                  </span>
                  <span className="font-mono font-bold text-stone-900">₹{deliveryCharge}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 py-5 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Total Payable</span>
                <span className="text-2xl font-bold text-amber-800">
                  ₹{Math.round(totalPayable).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60"
              >
                {isPlacingOrder
                  ? <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                  : "Confirm & Pay"}
              </button>

              {/* Delivery rate card */}
              <div className="mt-5 pt-5 border-t border-stone-100 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Delivery Rates</p>
                {[
                  { label: "Under 50 units", rate: 299 },
                  { label: "50 – 99 units",  rate: 699 },
                  { label: "100+ units",      rate: 899 },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    <span>{row.label}</span>
                    <span className={deliveryCharge === row.rate ? "text-amber-700" : ""}>
                      ₹{row.rate}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-stone-400 uppercase tracking-widest font-bold border-t border-stone-100 pt-4">
                <ShieldCheck size={13} className="text-emerald-500" /> Secured Checkout
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function InputField({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</label>
      <input
        {...props}
        className={`w-full h-12 px-4 bg-stone-50 border rounded-xl text-sm outline-none transition-all ${
          error ? "border-red-400 ring-2 ring-red-50" : "border-stone-200 focus:border-amber-500"
        }`}
      />
      {error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">! {error}</p>}
    </div>
  );
}