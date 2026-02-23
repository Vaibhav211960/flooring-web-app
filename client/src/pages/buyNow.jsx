import React, { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Home as HomeIcon, ChevronRight, Truck, ShieldCheck, 
  Package, Loader2 
} from "lucide-react";
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

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [units, setUnits] = useState(initialQty);
  const [form, setForm] = useState({
    fullName: "",
    contact: "",
    pincode: "",
    landmark: "",
    address: ""
  });

  // Fetch Data
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

  // Financial Calculations
  const financialData = useMemo(() => {
    const basePrice = (product?.price || 0) * units;
    
    let percentage = 0;
    let nextTier = 5000;

    if (basePrice > 10000) { percentage = 7; nextTier = null; }
    else if (basePrice > 5000) { percentage = 2; nextTier = 10000; }
    else { percentage = 0; nextTier = 5000; }

    const discountAmount = (basePrice * percentage) / 100;
    const discountedPrice = basePrice - discountAmount;

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
      netBill: discountedPrice + delivery,
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
    if (name !== "landmark") {
      setFormErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleGoToPayment = async () => {
    // Validate Form
    const errors = {};
    Object.keys(form).forEach(key => {
      if (key !== "landmark") {
        const error = validate(key, form[key]);
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: "SHIPPING ERROR",
        description: "Please correct the errors in your address form.",
        variant: "destructive",
        className: "bg-stone-950 border-stone-800 text-white rounded-xl shadow-2xl p-6",
      });
      return;
    }

    setIsPlacingOrder(true);

   // 1. Capture the final state of data
const checkoutData = {
  items: [{
    productId: product._id,
    productName: product.name,
    pricePerUnit: product.price,
    units: units,
    totalAmount: financialData.subtotal
  }],
  form: form, // Changed from shippingAddress to form to match Payment.js state
  netBill: financialData.netBill, // Simplified to match what Payment.js destructured
  financials: financialData // Kept just in case you need extra details later
};
localStorage.setItem("checkout_details", JSON.stringify(checkoutData));

  setTimeout(() => {
    toast({ title: "ADDRESS SAVED", description: "Proceeding to secure payment gateway.", className: "bg-stone-950 border-stone-800 text-white rounded-xl shadow-2xl p-6" });
    navigate("/checkout/payment", { state: checkoutData });
  }, 800);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="animate-spin text-amber-700" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 py-12">
        <div className="container max-w-7xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link> 
            <ChevronRight size={12} /> 
            <span className="text-amber-500">Checkout</span>
          </nav>
          <h1 className="text-4xl font-serif font-bold italic">Review & <span className="not-italic text-white">Purchase</span></h1>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Truck className="text-amber-700" />
                <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Shipping Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleInput} error={formErrors.fullName} />
                <InputField label="Mobile Number" name="contact" value={form.contact} onChange={handleInput} error={formErrors.contact} />
                <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleInput} error={formErrors.pincode} />
                <InputField label="Landmark (Optional)" name="landmark" value={form.landmark} onChange={handleInput} />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Full Address</label>
                  <textarea 
                    name="address" rows="3" value={form.address} onChange={handleInput}
                    className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${formErrors.address ? "border-red-500 bg-red-50" : "border-stone-200 focus:border-amber-500"}`}
                  />
                  {formErrors.address && <p className="text-xs text-red-500 font-medium">{formErrors.address}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 flex gap-6 items-center">
              <img src={product.image} className="w-24 h-24 object-cover rounded-xl border border-stone-100" alt="" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">{product.woodType} / {product.thicknessMM}mm</p>
                <div className="mt-4 flex items-center border border-stone-200 w-fit rounded-lg overflow-hidden bg-stone-50">
                  <button onClick={() => setUnits(Math.max(1, units - 1))} className="px-3 py-1 hover:bg-stone-200">-</button>
                  <span className="px-4 font-mono font-bold text-sm bg-white border-x border-stone-200">{units}</span>
                  <button onClick={() => setUnits(units + 1)} className="px-3 py-1 hover:bg-stone-200">+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-mono font-bold">₹{product.price.toLocaleString()}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Per Unit</p>
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xl sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-4 text-stone-400">Financial Summary</h2>
              
              <div className="space-y-4 border-b pb-6">
                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Gross Subtotal</span>
                  <span className="font-mono text-stone-950 font-bold">₹{financialData.subtotal.toLocaleString()}</span>
                </div>

                {financialData.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-sm">
                    <span>Loyalty Discount ({financialData.discountPercentage}%)</span>
                    <span className="font-mono">-₹{financialData.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500 text-sm">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-stone-950 font-bold">₹{financialData.deliveryCharge.toLocaleString()}</span>
                </div>

                {financialData.nextTierAmount > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-[9px] uppercase mb-1">
                      <Package size={14} /> Tier Reward Available
                    </div>
                    <p className="text-[10px] text-amber-700 leading-tight">
                      Add <b>₹{financialData.nextTierAmount.toLocaleString()}</b> to unlock a higher discount tier.
                    </p>
                  </div>
                )}
              </div>

              <div className="py-8 flex justify-between items-baseline">
                <span className="font-bold text-stone-400 text-[10px] uppercase tracking-widest">Amount Due</span>
                <span className="text-4xl font-serif font-bold text-amber-900">₹{financialData.netBill.toLocaleString()}</span>
              </div>

              <Button 
                onClick={handleGoToPayment} 
                disabled={isPlacingOrder} 
                className="w-full h-16 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg hover:bg-stone-800"
              >
                {isPlacingOrder ? <Loader2 className="animate-spin" /> : "Proceed to Payment"}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Verified Secure Checkout
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
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase text-stone-500 tracking-widest">{label}</label>
      <input 
        {...props} 
        className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${
          error ? "border-red-500 bg-red-50/50" : "border-stone-200 focus:border-amber-500 bg-stone-50/30"
        }`} 
      />
      {error && <p className="text-[10px] text-red-600 font-bold uppercase animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
}