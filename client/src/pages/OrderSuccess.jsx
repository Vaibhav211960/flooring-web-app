import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Package, Truck, 
  ArrowRight, Home, ShoppingBag, MapPin, User
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from the Checkout form and Cart items
  const { items, form, netBill } = location.state || {};

  // Security: Redirect if accessed without order data
  if (!items || !form) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
        <ShoppingBag className="h-12 w-12 text-stone-200 mb-4" />
        <h2 className="font-serif text-xl text-stone-400 uppercase tracking-widest">No Active Session</h2>
        <Button onClick={() => navigate("/")} className="mt-6 bg-stone-900 text-white px-8 h-12 uppercase tracking-widest text-[10px]">Return to Gallery</Button>
      </div>
    );
  }

  // Generate a random static Order ID since we aren't using the Backend ID
  const staticOrderId = useMemo(() => `GF-${Math.floor(100000 + Math.random() * 900000)}`, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container max-w-5xl mx-auto px-6">
          
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-5xl font-serif font-bold tracking-tight">Purchase <span className="italic text-amber-600">Complete</span></h1>
            <p className="mt-4 text-stone-500 font-serif italic">Your project materials are now reserved for dispatch.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: STATIC MANIFEST */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 bg-stone-900 text-white flex justify-between items-center">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Reference Number</p>
                    <p className="font-mono text-lg font-bold">{staticOrderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400">Order Date</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
                    <Package size={18} className="text-amber-600" /> Itemized Manifest
                  </h3>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-stone-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-stone-800">{item.productName || item.name}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.units || item.quantity} Units @ ₹{item.pricePerUnit || item.price}</p>
                        </div>
                        <p className="font-mono font-bold text-stone-900">₹{(item.totalAmount || (item.price * item.quantity)).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Total Investment</p>
                    <p className="text-4xl font-mono font-bold text-amber-800 tracking-tighter">₹{netBill.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: STATIC SHIPPING INFO */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
                <h3 className="font-serif font-bold text-lg mb-6 border-b border-stone-100 pb-4">Dispatch Detail</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <User size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Consignee</p>
                      <p className="text-sm font-bold text-stone-800">{form.fullName}</p>
                      <p className="text-xs text-stone-500">{form.contact}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <MapPin size={18} className="text-stone-300 mt-1" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Destination Address</p>
                      <p className="text-sm text-stone-600 leading-relaxed italic">
                        {form.address}<br />
                        {form.landmark && `${form.landmark}, `}{form.pincode}
                      </p>
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