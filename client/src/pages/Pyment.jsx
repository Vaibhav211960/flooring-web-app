import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  CreditCard, 
  Smartphone, 
  Truck, 
  ShieldCheck, 
  Lock,
  ChevronLeft 
} from "lucide-react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast.jsx";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // 1. ACCESS THE DATA FROM STATE
  // We use optional chaining and default values to prevent crashes if state is empty
  const { items, form, netBill } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  // Redirect back if user tries to access payment page directly without order data
  useEffect(() => {
    if (!items || !netBill) {
      navigate("/cart");
    }
  }, [items, netBill, navigate]);

  const handleFinalizeOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);


      toast({
        title: "ORDER PLACED",
        description: "Your transaction has been confirmed.",
        className: "bg-stone-950 border border-stone-800 text-white rounded-xl p-6",
      });
      navigate("/order-success", { state: {  items , form , netBill } });
      
    //   toast({
    //     title: "TRANSACTION FAILED",
    //     description: error.response?.data?.message || "Payment gateway connection error.",
    //     variant: "destructive",
    //     className: "bg-stone-950 border border-stone-800 text-white rounded-xl p-6",
    //   });
    //   setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20 py-10">
        <div className="container max-w-7xl mx-auto px-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors mb-4 text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Shipping
          </button>
          <h1 className="font-serif text-3xl font-bold">
            Finalize <span className="italic text-amber-500">Payment</span>
          </h1>
        </div>
      </section>

      <div className="flex-1 container max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: PAYMENT OPTIONS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="text-amber-600" />
              <h3 className="font-bold uppercase tracking-widest text-sm">Select Secure Method</h3>
            </div>

            <RadioGroup 
              value={paymentMode} 
              onValueChange={setPaymentMode}
              className="grid gap-4"
            >
              <PaymentCard 
                id="UPI" 
                icon={<Smartphone className="text-stone-600" />} 
                title="UPI Transfer" 
                description="Google Pay, PhonePe, or BHIM"
                current={paymentMode}
              />
              <PaymentCard 
                id="Net Banking" 
                icon={<CreditCard className="text-stone-600" />} 
                title="Net Banking" 
                description="Secure transfer from all major banks"
                current={paymentMode}
              />
              <PaymentCard 
                id="COD" 
                icon={<Truck className="text-stone-600" />} 
                title="Cash on Delivery" 
                description="Pay in cash upon delivery"
                current={paymentMode}
              />
            </RadioGroup>
          </div>

          {/* Shipping Summary Reveal */}
          <div className="bg-stone-100/50 rounded-xl p-6 border border-dashed border-stone-300">
            <h4 className="text-[10px] uppercase font-bold text-stone-500 tracking-widest mb-2">Shipping To:</h4>
            <p className="text-sm font-medium text-stone-700">{form?.address}, {form?.city} - {form?.zipCode}</p>
          </div>
        </div>

        {/* RIGHT: TOTAL BOX */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900 text-stone-50 rounded-2xl p-8 sticky top-24 shadow-2xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-6 border-b border-stone-800 pb-4">Billing Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Items ({items?.length || 0})</span>
                <span className="font-mono text-stone-300">₹{netBill}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Processing Fee</span>
                <span className="text-green-500 uppercase text-[10px] tracking-tighter">Waived</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-10">
              <span className="text-xs font-bold uppercase tracking-widest">Net Bill</span>
              <span className="text-4xl font-serif text-amber-500">₹{netBill}</span>
            </div>

            <Button 
              onClick={handleFinalizeOrder}
              disabled={isLoading}
              className="w-full h-14 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest transition-all rounded-xl"
            >
              {isLoading ? "Verifying..." : `Pay ₹${netBill}`}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
              <Lock size={10} /> 256-bit Secure Transaction
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Sub-component for Payment Selection
function PaymentCard({ id, icon, title, description, current }) {
  const isActive = current === id;
  return (
    <Label 
      htmlFor={id} 
      className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer ${
        isActive ? 'border-amber-600 bg-amber-50/50' : 'border-stone-100 hover:border-stone-200 bg-stone-50/30'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-lg border border-stone-100 shadow-sm">{icon}</div>
        <div>
          <p className="font-bold text-sm text-stone-900">{title}</p>
          <p className="text-[10px] text-stone-500 uppercase tracking-tight">{description}</p>
        </div>
      </div>
      <RadioGroupItem value={id} id={id} className="border-stone-300 text-amber-600" />
    </Label>
  );
}