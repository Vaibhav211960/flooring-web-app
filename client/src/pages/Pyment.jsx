import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  Lock,
  ChevronLeft,
  Loader2,
  Home as HomeIcon,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast.jsx";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();

  const [checkoutItems] = useState(() => {
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.items) return singleData.items;
    return JSON.parse(localStorage.getItem("checkout_products")) || [];
  });

  const [shippingAddress] = useState(() => {
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.form) return singleData.form;
    return JSON.parse(localStorage.getItem("temp_shipping_address")) || null;
  });

  const [netBill] = useState(() => {
    const singleData = JSON.parse(localStorage.getItem("checkout_details"));
    if (singleData && singleData.netBill) return singleData.netBill;
    return checkoutItems.reduce((acc, item) => acc + (item.total || 0), 0);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    if (checkoutItems.length === 0 || !shippingAddress) {
      toast({
        title: "Session Expired",
        description: "Please restart the checkout process.",
      });
      navigate("/cart");
    }
  }, [checkoutItems, shippingAddress, navigate, toast]);

  const handleFinalizeOrder = async () => {
    setIsLoading(true);
    try {
      const userToken = localStorage.getItem("UserToken");

      const orderPayload = {
        items: checkoutItems.map((item) => ({
          productId: item.productId || item._id,
          productName: item.name || item.productName,
          pricePerUnit: item.price || item.pricePerUnit,
          units: item.quantity || item.units,
          totalAmount: item.total || item.totalAmount,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          address: shippingAddress.address,
          landmark: shippingAddress.landmark,
          pincode: shippingAddress.pincode,
          contact: shippingAddress.contact,
        },
        netBill,
        paymentMode,
        paymentMethod:
          paymentMode.toLowerCase() === "net banking"
            ? "card"
            : paymentMode.toLowerCase(),
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
        });

        const isSingleBuy = localStorage.getItem("checkout_details");
        if (isSingleBuy) {
          localStorage.removeItem("checkout_details");
          localStorage.removeItem("pending_product");
          localStorage.removeItem("pending_qty");
        } else {
          localStorage.removeItem("checkout_products");
          localStorage.removeItem("temp_shipping_address");
          await clearCart();
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

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/cart" className="hover:text-white transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Payment</span>
          </nav>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors mb-4 text-[10px] uppercase tracking-widest font-bold"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Final Step
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Finalize{" "}
            <span className="italic text-amber-400">Acquisition</span>
          </h1>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="flex-1 container max-w-6xl mx-auto py-12 md:py-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Payment Methods + Address */}
        <div className="lg:col-span-2 space-y-6">

          {/* Payment Selection */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 flex items-center gap-2">
                <ShieldCheck size={14} /> Select Secure Method
              </p>
            </div>
            <div className="p-6 space-y-3">
              <PaymentCard
                id="UPI"
                icon={<Smartphone size={18} />}
                title="UPI Transfer"
                description="Instant Settlement"
                selected={paymentMode === "UPI"}
                onSelect={() => setPaymentMode("UPI")}
              />
              <PaymentCard
                id="Net Banking"
                icon={<CreditCard size={18} />}
                title="Net Banking"
                description="Bank Direct"
                selected={paymentMode === "Net Banking"}
                onSelect={() => setPaymentMode("Net Banking")}
              />
              <PaymentCard
                id="COD"
                icon={<Truck size={18} />}
                title="Cash on Delivery"
                description="Pay at Project Site"
                selected={paymentMode === "COD"}
                onSelect={() => setPaymentMode("COD")}
              />
            </div>
          </div>

          {/* Shipping Destination Preview */}
          <div className="bg-stone-50 rounded-xl p-6 border border-dashed border-stone-200">
            <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-2">
              Shipping Destination
            </p>
            <p className="text-sm font-medium text-stone-700 uppercase italic leading-relaxed">
              {shippingAddress?.fullName} —{" "}
              {shippingAddress?.address},{" "}
              {shippingAddress?.landmark && `${shippingAddress.landmark}, `}
              {shippingAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900 text-stone-50 rounded-2xl sticky top-24 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-800">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                Financial Summary
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Total Materials</span>
                <span className="font-bold text-stone-200">
                  ₹{netBill.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Logistics</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                  Included
                </span>
              </div>
              <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Net Bill
                </span>
                <span className="text-3xl font-serif font-bold text-amber-500">
                  ₹{netBill.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={handleFinalizeOrder}
                disabled={isLoading}
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  `Authorize ₹${netBill.toLocaleString()}`
                )}
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
                <Lock size={10} /> 256-bit Encrypted Transaction
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PaymentCard({ id, icon, title, description, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all text-left ${
        selected
          ? "border-amber-600 bg-amber-50/50 shadow-inner"
          : "border-stone-100 hover:border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg border shadow-sm transition-colors ${
            selected
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white text-stone-600 border-stone-200"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm text-stone-900 uppercase tracking-tight">
            {title}
          </p>
          <p className="text-[10px] text-stone-500">{description}</p>
        </div>
      </div>
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "border-amber-600" : "border-stone-300"
        }`}
      >
        {selected && (
          <div className="w-2 h-2 rounded-full bg-amber-600" />
        )}
      </div>
    </button>
  );
}