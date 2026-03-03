import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Truck, ShieldCheck, Package, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import { useToast } from "../hooks/useToast";

export default function BuyNow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const initialQty = location.state?.quantity || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [units, setUnits] = useState(initialQty);
  const [form, setForm] = useState({
    fullName: "", contact: "", pincode: "", landmark: "", address: ""
  });

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

  const financialData = useMemo(() => {
    const basePrice = (product?.price || 0) * units;
    let percentage = 0;
    let nextTier = 5000;
    if (basePrice > 10000) { percentage = 7; nextTier = null; }
    else if (basePrice > 5000) { percentage = 2; nextTier = 10000; }
    const discountAmount = (basePrice * percentage) / 100;
    let delivery = 0;
    if (basePrice <= 500) delivery = 99;
    else if (basePrice <= 1500) delivery = 149;
    else if (basePrice <= 5000) delivery = 299;
    else delivery = 499;
    return {
      subtotal: basePrice,
      discount: discountAmount,
      discountPercentage: percentage,
      deliveryCharge: delivery,
      netBill: basePrice - discountAmount + delivery,
      nextTierAmount: nextTier ? nextTier - basePrice : 0
    };
  }, [units, product]);

  const validate = (name, value) => {
    switch (name) {
      case "fullName": return value.trim().length < 3 ? "Name is too short" : "";
      case "contact": return /^[6-9]\d{9}$/.test(value) ? "" : "Invalid mobile number";
      case "pincode": return /^\d{6}$/.test(value) ? "" : "Invalid 6-digit pincode";
      case "address": return value.trim().length < 10 ? "Full address required" : "";
      default: return "";
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    if ((name === "pincode" || name === "contact") && value !== "" && !/^\d+$/.test(value)) return;
    if (name === "pincode" && value.length > 6) return;
    if (name === "contact" && value.length > 10) return;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name !== "landmark") setFormErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleGoToPayment = async () => {
    const errs = {};
    Object.keys(form).forEach(key => {
      if (key !== "landmark") {
        const error = validate(key, form[key]);
        if (error) errs[key] = error;
      }
    });
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      toast({ title: "Shipping Error", description: "Please correct the errors in your address.", variant: "destructive" });
      return;
    }
    setIsPlacingOrder(true);
    const checkoutData = {
      items: [{ productId: product._id, productName: product.name, pricePerUnit: product.price, units, totalAmount: financialData.subtotal }],
      form,
      netBill: financialData.netBill,
      financials: financialData
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
              <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
                <Truck className="text-stone-400" size={16} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Shipping Details
                </p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleInput} error={formErrors.fullName} />
                <InputField label="Mobile Number" name="contact" value={form.contact} onChange={handleInput} error={formErrors.contact} />
                <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleInput} error={formErrors.pincode} />
                <InputField label="Landmark (Optional)" name="landmark" value={form.landmark} onChange={handleInput} />
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={form.address}
                    onChange={handleInput}
                    className={`w-full p-4 rounded-xl border text-sm outline-none transition-all resize-none ${
                      formErrors.address ? "border-red-400 bg-red-50/30" : "border-stone-200 bg-stone-50 focus:border-amber-500"
                    }`}
                  />
                  {formErrors.address && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">! {formErrors.address}</p>}
                </div>
              </div>
            </div>

            {/* Product Row */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Your Order</p>
              </div>
              <div className="p-5 flex items-center gap-5">
                <img src={product.image} className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0" alt={product.name} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-stone-900 truncate">{product.name}</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                    {product.woodType && `${product.woodType} · `}{product.thicknessMM}mm
                  </p>
                  <div className="mt-3 flex items-center border border-stone-200 w-fit rounded-xl overflow-hidden">
                    <button onClick={() => setUnits(Math.max(1, units - 1))} className="px-4 py-2 hover:bg-stone-50 text-stone-700 font-bold transition-colors">−</button>
                    <span className="px-4 py-2 font-mono font-bold text-sm border-x border-stone-200 min-w-[2.5rem] text-center">{units}</span>
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
                  <span className="font-mono font-bold text-stone-900">₹{financialData.subtotal.toLocaleString()}</span>
                </div>
                {financialData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({financialData.discountPercentage}%)</span>
                    <span className="font-mono">−₹{financialData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-mono font-bold text-stone-900">₹{financialData.deliveryCharge.toLocaleString()}</span>
                </div>
                {financialData.nextTierAmount > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[9px] uppercase mb-1">
                      <Package size={12} /> Tier Unlock Available
                    </div>
                    <p className="text-[10px] text-amber-700">
                      Add <b>₹{financialData.nextTierAmount.toLocaleString()}</b> for a higher discount.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200 py-5 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Total Payable</span>
                <span className="text-2xl font-bold text-amber-800">₹{financialData.netBill.toLocaleString()}</span>
              </div>

              <Button
                onClick={handleGoToPayment}
                disabled={isPlacingOrder}
                className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-md disabled:opacity-60"
              >
                {isPlacingOrder ? <Loader2 className="animate-spin h-4 w-4" /> : "Proceed to Payment"}
              </Button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[9px] text-stone-400 uppercase tracking-widest font-bold border-t border-stone-100 pt-5">
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