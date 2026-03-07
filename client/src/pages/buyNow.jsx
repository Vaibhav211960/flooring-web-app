import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Truck, ShieldCheck, Package, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast";
import { getDiscountData, getDeliveryCharge } from "../pages/Cart";

// ── Validation rules (identical to BuyAll) ─────────────────────────────────
const VALIDATORS = {
  fullName: (v) => {
    if (!v.trim()) return "Full name is required";
    if (v.trim().length < 3) return "Name must be at least 3 characters";
    if (v.trim().length > 60) return "Name must be under 60 characters";
    if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) return "Name must contain only letters";
    return "";
  },
  contact: (v) => {
    const digits = v.replace(/\D/g, "");
    if (!digits) return "Contact number is required";
    if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number";
    return "";
  },
  pincode: (v) => {
    if (!v.trim()) return "Pincode is required";
    if (!/^\d{6}$/.test(v.trim())) return "Enter a valid 6-digit pincode";
    if (/^0{6}$/.test(v.trim())) return "Enter a valid pincode";
    return "";
  },
  landmark: () => "",
  address: (v) => {
    if (!v.trim()) return "Delivery address is required";
    if (v.trim().length < 15) return "Please enter a more complete address (min 15 chars)";
    if (v.trim().length > 300) return "Address is too long (max 300 chars)";
    return "";
  },
};

const validateAll = (form) =>
  Object.fromEntries(Object.entries(VALIDATORS).map(([k, fn]) => [k, fn(form[k])]));

const hasErrors = (errs) => Object.values(errs).some(Boolean);

export default function BuyNow() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const location   = useLocation();

  const initialQty = location.state?.quantity || 1;

  const [product,        setProduct]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [units,          setUnits]          = useState(initialQty);
  const [touched,        setTouched]        = useState({});

  const [form, setForm] = useState({
    fullName: "", contact: "", pincode: "", landmark: "", address: "",
  });

  const allErrors     = useMemo(() => validateAll(form), [form]);
  const visibleErrors = Object.fromEntries(
    Object.entries(allErrors).map(([k, v]) => [k, touched[k] ? v : ""])
  );
  const formIsValid = !hasErrors(allErrors);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ── Financials ─────────────────────────────────────────────────────────────
  const financialData = useMemo(() => {
    const subtotal = (product?.price || 0) * units;
    const discount = getDiscountData(subtotal);
    const delivery = getDeliveryCharge(units);
    const netBill  = subtotal - discount.amt + delivery;

    let nextTierAmount = 0;
    if (subtotal < 5000)       nextTierAmount = 5000  - subtotal;
    else if (subtotal < 10000) nextTierAmount = 10000 - subtotal;

    return {
      subtotal,
      discount:           discount.amt,
      discountPercentage: discount.p,
      deliveryCharge:     delivery,
      netBill,
      nextTierAmount,
    };
  }, [units, product]);

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "contact") formatted = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") formatted = value.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, [name]: formatted }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleGoToPayment = async () => {
    setTouched({ fullName: true, contact: true, pincode: true, landmark: true, address: true });

    if (hasErrors(allErrors)) {
      toast({
        title: "Shipping Error",
        description: "Please correct the errors in your address.",
        variant: "destructive",
      });
      const firstErrorKey = Object.entries(allErrors).find(([, v]) => v)?.[0];
      if (firstErrorKey) {
        document.querySelector(`[name="${firstErrorKey}"]`)?.scrollIntoView({
          behavior: "smooth", block: "center",
        });
      }
      return;
    }

    setIsPlacingOrder(true);
    const checkoutData = {
      items: [{
        productId:    product._id,
        productName:  product.name,
        pricePerUnit: product.price,
        units,
        totalAmount:  financialData.subtotal,
      }],
      form,
      netBill:    financialData.netBill,
      financials: financialData,
    };
    localStorage.setItem("checkout_details", JSON.stringify(checkoutData));
    setTimeout(() => {
      toast({ title: "Address Saved", description: "Proceeding to secure payment." });
      navigate("/checkout/payment", { state: checkoutData });
    }, 800);
  };

  if (loading) return (
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
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to={`/products/${id}`} className="hover:text-white transition-colors">Details</Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Checkout</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Secure Checkout
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Review & <span className="italic text-amber-400">Purchase</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left */}
          <div className="lg:col-span-8 space-y-6">

            {/* Shipping Form */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="text-stone-400" size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                    Shipping Details
                  </p>
                </div>
                {/* Live completion indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {["fullName", "contact", "pincode", "address"].map((field) => (
                      <div
                        key={field}
                        className={`h-1 w-5 rounded-full transition-all duration-300 ${
                          !allErrors[field] && form[field] ? "bg-emerald-400" : "bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                    {["fullName", "contact", "pincode", "address"].filter(
                      (f) => !allErrors[f] && form[f]
                    ).length}/4
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  error={visibleErrors.fullName}
                  success={touched.fullName && !allErrors.fullName}
                  placeholder="As on ID proof"
                />
                <InputField
                  label="Mobile Number"
                  name="contact"
                  value={form.contact}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  error={visibleErrors.contact}
                  success={touched.contact && !allErrors.contact}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                />
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  error={visibleErrors.pincode}
                  success={touched.pincode && !allErrors.pincode}
                  placeholder="6-digit postal code"
                  maxLength={6}
                  inputMode="numeric"
                />
                <InputField
                  label="Landmark (Optional)"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleInput}
                  onBlur={handleBlur}
                  placeholder="Near school, temple…"
                  isOptional
                />

                {/* Address textarea */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Full Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      rows="3"
                      value={form.address}
                      onChange={handleInput}
                      onBlur={handleBlur}
                      maxLength={300}
                      className={`w-full rounded-xl border p-4 text-sm outline-none transition-all resize-none ${
                        visibleErrors.address
                          ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
                          : touched.address && !allErrors.address
                          ? "border-emerald-400 ring-2 ring-emerald-50"
                          : "border-stone-200 bg-stone-50 focus:border-amber-500"
                      }`}
                      placeholder="House/Flat no., Street, Area, City, State…"
                    />
                    <span className="absolute bottom-3 right-3 text-[9px] text-stone-400 font-bold">
                      {form.address.length}/300
                    </span>
                  </div>
                  {visibleErrors.address ? (
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
                      <span>!</span> {visibleErrors.address}
                    </p>
                  ) : touched.address && !allErrors.address ? (
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
                      <span></span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-stone-400 tracking-wide">
                      Minimum 15 characters · Be specific for accurate delivery
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Row */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Your Order</p>
              </div>
              <div className="p-5 flex items-center gap-5">
                <img
                  src={product.image}
                  className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0"
                  alt={product.name}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-stone-900 truncate">{product.name}</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                    {product.woodType && `${product.woodType} · `}{product.thicknessMM}mm
                  </p>
                  <div className="mt-3 flex items-center border border-stone-200 w-fit rounded-xl overflow-hidden">
                    <button
                      onClick={() => setUnits(Math.max(1, units - 1))}
                      className="px-4 py-2 hover:bg-stone-50 text-stone-700 font-bold transition-colors"
                    >−</button>
                    <span className="px-4 py-2 font-mono font-bold text-sm border-x border-stone-200 min-w-[2.5rem] text-center">
                      {units}
                    </span>
                    <button
                      onClick={() => setUnits(units + 1)}
                      disabled={product.stock && units >= product.stock}
                      className="px-4 py-2 hover:bg-stone-50 text-stone-700 font-bold transition-colors disabled:opacity-30"
                    >+</button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-mono font-bold text-stone-900">₹{product.price.toLocaleString()}</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">per {product.unit}</p>
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
                  <span className="font-mono font-bold text-stone-900">
                    ₹{financialData.subtotal.toLocaleString()}
                  </span>
                </div>
                {financialData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({financialData.discountPercentage}%)</span>
                    <span className="font-mono">−₹{Math.round(financialData.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>
                    Delivery
                    <span className="ml-1 text-[9px] text-stone-400 font-bold">({units} units)</span>
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    ₹{financialData.deliveryCharge.toLocaleString()}
                  </span>
                </div>

                {financialData.nextTierAmount > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[9px] uppercase mb-1">
                      <Package size={12} /> Discount Tier Available
                    </div>
                    <p className="text-[10px] text-amber-700">
                      Add <b>₹{financialData.nextTierAmount.toLocaleString()}</b> more to unlock a higher discount.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200 py-5 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Total Payable</span>
                <span className="text-2xl font-bold text-amber-800">
                  ₹{Math.round(financialData.netBill).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleGoToPayment}
                disabled={isPlacingOrder}
                className={`w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-md disabled:opacity-60 ${
                  formIsValid && Object.keys(touched).length >= 4
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-200"
                    : "bg-stone-900 hover:bg-stone-800 text-white"
                }`}
              >
                {isPlacingOrder
                  ? <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                  : "Proceed to Payment"}
              </button>

              {!formIsValid && Object.keys(touched).length > 0 && (
                <p className="mt-3 text-center text-[9px] text-red-500 font-bold uppercase tracking-widest">
                  Please fix errors above to continue
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-stone-400 uppercase tracking-widest font-bold border-t border-stone-100 pt-4">
                <ShieldCheck size={13} className="text-emerald-500" /> Verified Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── InputField — identical to BuyAll ───────────────────────────────────────
function InputField({ label, error, success, isOptional, ...props }) {
  const borderClass = error
    ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
    : success
    ? "border-emerald-400 ring-2 ring-emerald-50"
    : "border-stone-200 bg-stone-50 focus:border-amber-500";

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {label}
        {!isOptional && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        {...props}
        className={`w-full h-12 px-4 border rounded-xl text-sm outline-none transition-all ${borderClass}`}
      />
      {error ? (
        <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span>!</span> {error}
        </p>
      ) : success ? (
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span></span>
        </p>
      ) : null}
    </div>
  );
}