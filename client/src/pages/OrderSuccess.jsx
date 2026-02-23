import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, 
  Home, ShoppingBag, MapPin, User, Volume2, VolumeX
} from "lucide-react";
import { Button } from "../ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Get real data from the navigation state sent by Payment.js
  const { order, payment } = location.state || {};
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Security: Redirect if accessed without order data
  useEffect(() => {
    if (!order) {
      navigate("/");
    }
  }, [order, navigate]);

  // 2. Voice Synthesis Logic
  const speakOrderSummary = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const message = `Thank you, ${order.shippingAddress.fullName}. Your order for ${order.items.length} item is confirmed. The total investment of ${order.netBill} rupees is secured under reference number ${order._id.substring(0, 8)}. Your premium flooring materials are being prepared for dispatch to ${order.shippingAddress.address}.`;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9; // Slightly slower for premium feel
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-5xl mx-auto px-6">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 relative">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <button 
                onClick={speakOrderSummary}
                className="absolute -right-12 bottom-0 p-3 bg-white border border-stone-200 rounded-full shadow-sm hover:text-amber-600 transition-colors"
                title="Hear Summary"
              >
                {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
            <h1 className="text-5xl font-serif font-bold tracking-tight">Purchase <span className="italic text-amber-600">Complete</span></h1>
            <p className="mt-4 text-stone-500 font-serif italic">The materials for your vision are now secured.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: ORDER MANIFEST */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 bg-stone-900 text-white flex justify-between items-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Order Reference</p>
                    <p className="font-mono text-lg font-bold">{order._id.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Payment ID</p>
                    <p className="text-sm font-mono text-amber-500 font-bold">{order.paymentId?.substring(0, 12) || "SECURED"}</p>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                    <Package size={18} className="text-amber-600" /> Itemized Manifest
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-stone-800">{item.productName}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.units} Units @ ₹{item.pricePerUnit}</p>
                        </div>
                        <p className="font-mono font-bold text-stone-900">₹{item.totalAmount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Net Bill Paid</p>
                    <p className="text-4xl font-mono font-bold text-amber-800 tracking-tighter">₹{order.netBill.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SHIPPING & ACTIONS */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
                <h3 className="font-serif font-bold text-lg mb-6 border-b border-stone-100 pb-4 text-stone-800">Dispatch Detail</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <User size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Consignee</p>
                      <p className="text-sm font-bold text-stone-800">{order.shippingAddress.fullName}</p>
                      <p className="text-xs text-stone-500">{order.shippingAddress.contact}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Destination</p>
                      <p className="text-sm text-stone-600 leading-relaxed italic">
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-50">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Truck size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Status: {order.orderStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => window.print()}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-900 h-14 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                >
                  Print Receipt
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-stone-900 text-white h-14 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                >
                  Return Home
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}