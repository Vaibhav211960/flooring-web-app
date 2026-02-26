import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  Lock,
  ChevronLeft,
  Loader2,
} from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast.jsx";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();

  // --- LOGIC TO DETECT SOURCE (SINGLE BUY VS CART) ---
  const [checkoutItems] = useState(() => {
    // 1. Check if single buy data exists
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.items) return singleData.items;
    
    // 2. Fallback to Cart Snapshot
    return JSON.parse(localStorage.getItem("checkout_products")) || [];
  });

  const [shippingAddress] = useState(() => {
    // 1. Check if single buy address exists
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.form) return singleData.form;

    // 2. Fallback to Cart Address
    return JSON.parse(localStorage.getItem("temp_shipping_address")) || null;
  });

  const [netBill] = useState(() => {
    // 1. Check if single buy bill exists
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.netBill) return singleData.netBill;

    // 2. Fallback to calculated total from Cart snapshot
    return checkoutItems.reduce((acc, item) => acc + (item.total || 0), 0);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    if (checkoutItems.length === 0 || !shippingAddress) {
      toast({ title: "Session Expired", description: "Please restart the checkout process." });
      navigate("/cart");
    }
  }, [checkoutItems, shippingAddress, navigate, toast]);

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userToken = localStorage.getItem("UserToken");

      const orderPayload = {
        items: checkoutItems.map(item => ({
          productId: item.productId || item._id, // Handles both schema variations
          productName: item.name || item.productName,
          pricePerUnit: item.price || item.pricePerUnit,
          units: item.quantity || item.units,
          totalAmount: item.total || item.totalAmount
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          address: shippingAddress.address,
          landmark: shippingAddress.landmark,
          pincode: shippingAddress.pincode,
          contact: shippingAddress.contact
        },
        netBill: netBill,
        paymentMode: paymentMode,
        paymentMethod: paymentMode.toLowerCase() === "net banking" ? "card" : paymentMode.toLowerCase()
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders/place", 
        orderPayload,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "ORDER PLACED",
          description: "Materials are being prepared for dispatch.",
          className: "bg-stone-950 border border-stone-800 text-white rounded-xl p-6 shadow-2xl",
        });

        // --- SELECTIVE CLEANUP ---
        const isSingleBuy = localStorage.getItem("checkout_details");
        
        if (isSingleBuy) {
          localStorage.removeItem("checkout_details");
          localStorage.removeItem("pending_product");
          localStorage.removeItem("pending_qty");
        } else {
          localStorage.removeItem("checkout_products");
          localStorage.removeItem("temp_shipping_address");
          await clearCart(); // Only clear the DB cart if it was a Cart Flow
        }

        navigate(`/orders/${response.data.order._id}`);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast({
        title: "TRANSACTION FAILED",
        description: error.response?.data?.message || "Check connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20 py-10">
        <div className="container max-w-7xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors mb-4 text-xs uppercase tracking-widest">
            <ChevronLeft size={14} /> Back
          </button>
          <h1 className="font-serif text-3xl font-bold">
            Finalize <span className="italic text-amber-500">Acquisition</span>
          </h1>
        </div>
      </section>

      <div className="flex-1 container max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="text-amber-600" />
              <h3 className="font-bold uppercase tracking-widest text-sm">Select Secure Method</h3>
            </div>

            <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="grid gap-4">
              <PaymentCard id="UPI" icon={<Smartphone />} title="UPI Transfer" description="Instant Settlement" current={paymentMode} />
              <PaymentCard id="Net Banking" icon={<CreditCard />} title="Net Banking" description="Bank Direct" current={paymentMode} />
              <PaymentCard id="COD" icon={<Truck />} title="Cash on Delivery" description="Pay at Project Site" current={paymentMode} />
            </RadioGroup>
          </div>

          <div className="bg-stone-100/50 rounded-xl p-6 border border-dashed border-stone-300">
            <h4 className="text-[10px] uppercase font-bold text-stone-500 tracking-widest mb-2">Shipping Destination:</h4>
            <p className="text-sm font-medium text-stone-700 uppercase italic">
              {shippingAddress?.fullName} — {shippingAddress?.address}, {shippingAddress?.landmark} ({shippingAddress?.pincode})
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-stone-900 text-stone-50 rounded-2xl p-8 sticky top-24 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-6 border-b border-stone-800 pb-4">Financial Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Total Materials</span>
                <span className="font-mono text-stone-300">₹{netBill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Logistics</span>
                <span className="text-green-500 uppercase text-[10px] tracking-widest">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-10">
              <span className="text-xs font-bold uppercase tracking-widest">Net Bill</span>
              <span className="text-4xl font-serif text-amber-500">₹{netBill.toLocaleString()}</span>
            </div>

            <Button onClick={handleFinalizeOrder} disabled={isLoading} className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95">
              {isLoading ? <Loader2 className="animate-spin" /> : `Authorize ₹${netBill.toLocaleString()}`}
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
              <Lock size={10} /> 256-bit Encrypted Transaction
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PaymentCard({ id, icon, title, description, current }) {
  const isActive = current === id;
  return (
    <Label htmlFor={id} className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer ${isActive ? "border-amber-600 bg-amber-50/50 shadow-inner" : "border-stone-100 hover:border-stone-200"}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg border shadow-sm ${isActive ? 'bg-amber-600 text-white' : 'bg-white text-stone-600'}`}>{icon}</div>
        <div>
          <p className="font-bold text-sm text-stone-900 uppercase tracking-tight">{title}</p>
          <p className="text-[10px] text-stone-500">{description}</p>
        </div>
      </div>
      <RadioGroupItem value={id} id={id} className="border-stone-300 text-amber-600" />
    </Label>
  );
}