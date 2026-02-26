import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  Truck,
  ShieldCheck,
  Package,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Gift,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import { useCart } from "../context/CartContext";
import { useToast } from "../hooks/useToast";

export default function BuyAll() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, getCartTotal, isLoading } = useCart();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // --- 1. INITIALIZE FROM LOCAL STORAGE ---
  const [form, setForm] = useState(() => {
    const savedAddress = localStorage.getItem("temp_shipping_address");
    return savedAddress ? JSON.parse(savedAddress) : {
      fullName: "",
      contact: "",
      pincode: "",
      landmark: "",
      address: "",
    };
  });

  const [errors, setErrors] = useState({});

  // --- 2. SYNC TO LOCAL STORAGE ON EVERY CHANGE ---
  useEffect(() => {
    localStorage.setItem("temp_shipping_address", JSON.stringify(form));
  }, [form]);

  const subtotal = getCartTotal();

  // --- BUSINESS LOGIC: DELIVERY ---
  const deliveryCharge = useMemo(() => {
    if (subtotal === 0) return 0;
    if (subtotal < 500) return 99;
    if (subtotal >= 500 && subtotal <= 1500) return 149;
    if (subtotal > 1500 && subtotal <= 5000) return 299;
    return 499; 
  }, [subtotal]);

  // --- BUSINESS LOGIC: DISCOUNTS ---
  const discountData = useMemo(() => {
    if (subtotal >= 10000) return { p: 7, amt: subtotal * 0.07, next: null };
    if (subtotal >= 5000) return { p: 2, amt: subtotal * 0.02, next: 10000 };
    return { p: 0, amt: 0, next: 5000 };
  }, [subtotal]);

  const totalPayable = subtotal - discountData.amt + deliveryCharge;

  const upsellMessage = useMemo(() => {
    if (subtotal < 5000) {
      return {
        text: `Buy ₹${(5000 - subtotal).toLocaleString()} more to unlock a 2% discount`,
        icon: <Gift size={14} className="text-amber-600" />,
        color: "bg-amber-50 border-amber-100 text-amber-900",
      };
    }
    if (subtotal >= 5000 && subtotal < 10000) {
      return {
        text: `Buy ₹${(10000 - subtotal).toLocaleString()} more to unlock a 7% discount`,
        icon: <Package size={14} className="text-emerald-600" />,
        color: "bg-emerald-50 border-emerald-100 text-emerald-900",
      };
    }
    return {
      text: "Maximum 7% Volume Discount Applied",
      icon: <ShieldCheck size={14} className="text-emerald-600" />,
      color: "bg-emerald-100 border-emerald-200 text-emerald-900",
    };
  }, [subtotal]);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, isLoading, navigate]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handlePlaceOrder = async () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name required";
    if (!/^\d{10}$/.test(form.contact))
      newErrors.contact = "Invalid 10-digit contact";
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Invalid pincode";
    if (form.address.length < 10) newErrors.address = "Address too short";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Incomplete Details",
        description: "Please refine your shipping destination.",
        variant: "destructive",
        className:
          "bg-stone-950 border border-stone-800 text-white rounded-xl shadow-2xl p-6",
      });
      return;
    }

    setIsPlacingOrder(true);

    setTimeout(() => {
      toast({
        title: "Address Saved Successfully",
        description: `Reference ID: FLR-${Math.floor(Math.random() * 90000)}`,
        className:
          "bg-stone-950 border border-stone-800 text-white rounded-xl shadow-2xl p-6",
      });
      
      // OPTIONAL: Clear the address from localstorage once the order is actually confirmed
      // localStorage.removeItem("temp_shipping_address");

      navigate("/checkout/payment", {
        state: { items: cartItems, form, netBill: totalPayable },
      });
      setIsPlacingOrder(false);
    }, 1500);
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-amber-700" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 pt-16 pb-12">
        <div className="container max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold uppercase">Dispatch Review</span>
          </nav>
          <h1 className="text-4xl font-serif font-bold italic">
            Secure <span className="not-italic text-white">Checkout</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-500 ${upsellMessage.color}`}>
              <div className="flex items-center gap-3">
                {upsellMessage.icon}
                <p className="text-[10px] font-bold uppercase tracking-[0.15em]">{upsellMessage.text}</p>
              </div>
              <div className="h-1 flex-1 mx-6 bg-stone-200/50 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-current transition-all duration-700"
                  style={{ width: `${Math.min((subtotal / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                <ShoppingBag className="text-stone-400" size={18} />
                <h2 className="font-serif font-bold text-lg">Project Inventory ({cartItems.length})</h2>
              </div>
              <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="p-6 flex items-center gap-6">
                    <img src={item.productId?.image || item.image} alt="tile" className="w-16 h-16 object-cover rounded-lg border border-stone-100 bg-stone-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-stone-800 uppercase tracking-tight">{item.productId?.name || item.name}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Units: {item.quantity}</p>
                    </div>
                    <p className="font-mono font-bold text-sm">₹{((item.productId?.price || item.price) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><Truck size={18} /></div>
                <h2 className="text-xl font-serif font-bold">Dispatch Destination</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Consignee Name" name="fullName" value={form.fullName} onChange={handleInput} error={errors.fullName} />
                <InputField label="Contact Number" name="contact" value={form.contact} onChange={handleInput} error={errors.contact} placeholder="+91" />
                <InputField label="Regional Pincode" name="pincode" value={form.pincode} onChange={handleInput} error={errors.pincode} />
                <InputField label="Dispatch Landmark" name="landmark" value={form.landmark} onChange={handleInput} error={errors.landmark} placeholder="Optional" />
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Architectural Address</label>
                  <textarea
                    name="address"
                    rows="3"
                    value={form.address}
                    onChange={handleInput}
                    className={`w-full rounded-xl border p-4 text-sm bg-stone-50 outline-none transition-all ${errors.address ? "border-red-400" : "border-stone-100 focus:border-amber-500 shadow-inner"}`}
                    placeholder="Site address..."
                  />
                  {errors.address && <p className="text-[10px] text-red-600 font-bold mt-1">! {errors.address}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8 sticky top-28">
              <h2 className="text-xl font-serif font-bold mb-6">Financial Summary</h2>
              <div className="space-y-4 text-sm border-b border-stone-100 pb-6">
                <div className="flex justify-between text-stone-500">
                  <span>Gross Total</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {discountData.p > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Volume Rebate ({discountData.p}%)</span>
                    <span className="font-mono">- ₹{discountData.amt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <div className="flex flex-col">
                    <span>Logistics Charge</span>
                    <span className="text-[9px] text-stone-400 italic">Tier: {deliveryCharge === 99 ? "Light" : deliveryCharge === 149 ? "Standard" : "Industrial"}</span>
                  </div>
                  <span className="font-mono">₹{deliveryCharge}</span>
                </div>
              </div>
              <div className="py-6 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase text-[10px] tracking-widest">Net Payable</span>
                <span className="text-3xl font-mono font-bold text-amber-800">₹{Math.round(totalPayable).toLocaleString()}</span>
              </div>
              <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full h-14 bg-stone-900 hover:bg-stone-800 text-white rounded-none font-bold uppercase tracking-widest transition-all active:scale-95">
                {isPlacingOrder ? <Loader2 className="animate-spin" /> : "Confirm & Pay"}
              </Button>
              <div className="mt-6 flex items-center justify-center gap-3 text-[9px] text-stone-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Secured Industrial Gateway
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
    <div className="space-y-2 flex flex-col">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">{label}</label>
      <input
        {...props}
        className={`w-full h-12 px-4 bg-stone-50 border rounded-xl text-sm outline-none transition-all shadow-inner ${error ? "border-red-400 ring-2 ring-red-50" : "border-stone-100 focus:border-amber-500"}`}
      />
      {error && <p className="text-[10px] text-red-600 font-bold mt-1 ml-1 uppercase tracking-tighter">! {error}</p>}
    </div>
  );
}