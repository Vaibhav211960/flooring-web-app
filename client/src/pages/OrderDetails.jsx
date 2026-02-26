import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { 
  Home as HomeIcon, ChevronRight, Package, Truck, 
  CreditCard, Download, ArrowLeft, CheckCircle2, 
  MapPin, User, Phone, Hash, Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` }
        });
        // Note: Assuming your backend returns { order: { ... } }
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <Loader2 className="animate-spin text-amber-600" size={40} />
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Manifest...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <p className="font-serif text-2xl text-stone-400 italic">Order not found</p>
          <Link to="/order-history" className="text-amber-700 font-bold uppercase tracking-widest text-xs underline">Return to Logs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* --- Architectural Header --- */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1"><HomeIcon className="h-3 w-3" /> Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/order-history" className="hover:text-white transition-colors">History</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest uppercase">Detail Log</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
                Order <span className="italic text-amber-500">#{order._id.slice(-6)}</span>
              </h1>
              <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">
                {order.paymentMode} Transaction • {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white gap-2 uppercase tracking-widest text-[10px] h-12 px-6">
              <Download size={14} /> Download Invoice
            </Button>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Tracking & Products */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Status Tracker */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 mb-8 flex items-center gap-2">
                <Truck size={16} /> Delivery Progress
              </h3>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 w-full h-[2px] bg-stone-100 -z-0"></div>
                
                <StatusStep icon={<CheckCircle2 size={18}/>} label="Confirmed" sub="Placed" active />
                <StatusStep icon={<Package size={18}/>} label="Processing" sub="Warehouse" active={order.orderStatus !== 'pending'} />
                <StatusStep icon={<Truck size={18}/>} label="In Transit" sub="Shipping" active={order.orderStatus === 'arriving' || order.orderStatus === 'delivered'} />
                <StatusStep icon={<HomeIcon size={18}/>} label="Delivered" sub="Project Site" active={order.orderStatus === 'delivered'} />
              </div>
            </div>

            {/* Items Manifest */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <h3 className="text-sm font-serif font-bold italic text-stone-600">Product Manifest</h3>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Transaction ID: {order.paymentId.slice(-8)}</span>
              </div>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-8 flex flex-col md:flex-row gap-6 items-center group">
                    <div className="h-20 w-20 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                      <Package size={32} strokeWidth={1} />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <h4 className="font-bold text-stone-800 text-lg leading-tight mb-1">{item.productName}</h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Product Ref: {item.productId.slice(-6)}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs text-stone-500 mb-1 font-medium italic">₹{item.pricePerUnit} per unit × {item.units}</p>
                      <p className="font-serif font-bold text-xl text-stone-900">₹{item.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: User Info & Billing */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* User & Shipping Info */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 mb-6 flex items-center gap-2">
                <MapPin size={16} /> Destination Details
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-amber-600 mt-1" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-400">Recipient</p>
                    <p className="text-sm font-bold text-stone-800 uppercase italic">{order.shippingAddress.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 mt-1" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-400">Site Address</p>
                    <p className="text-sm font-medium text-stone-600 leading-relaxed uppercase italic">
                      {order.shippingAddress.address}, <br />
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-50">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-stone-300" />
                    <span className="text-xs font-bold text-stone-700">{order.shippingAddress.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-stone-300" />
                    <span className="text-xs font-bold text-stone-700">{order.shippingAddress.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="bg-stone-900 text-stone-50 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-500 mb-8 flex items-center gap-2">
                <CreditCard size={16} /> Financial Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">Gross Bill</span>
                  <span className="font-bold">₹{order.netBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">Shipping Fee</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Included</span>
                </div>
                <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                  <span className="text-xs uppercase tracking-widest font-bold text-stone-400">Total Amount</span>
                  <span className="text-3xl font-serif font-bold text-amber-500">₹{order.netBill.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link to="/order-history" className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to History
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatusStep({ icon, label, sub, active = false }) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        active ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 
        'bg-white border-stone-100 text-stone-300'
      }`}>
        {icon}
      </div>
      <div className="text-center">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-stone-900' : 'text-stone-400'}`}>{label}</p>
        <p className="text-[9px] text-stone-400 font-medium">{sub}</p>
      </div>
    </div>
  );
}