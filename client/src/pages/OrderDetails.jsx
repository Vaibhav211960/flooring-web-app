import React from "react";
import { Link, useParams } from "react-router-dom";
import { 
  Home as HomeIcon, 
  ChevronRight, 
  Package, 
  Truck, 
  CreditCard, 
  Download,
  ArrowLeft,
  CheckCircle2,
  Clock
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

const ORDERS = [
  {
    _id: "ORD123456",
    orderDate: "2025-09-10",
    orderStatus: "arriving",
    paymentMode: "Online",
    netBill: 10195,
    items: [
      {
        productName: "Italian Marble Tile",
        sku: "IM-2024-XL",
        pricePerUnit: 2499,
        units: 2,
        discount: 200,
        totalAmount: 4798,
      },
      {
        productName: "Wooden Finish Tile",
        sku: "WF-T-99",
        pricePerUnit: 1799,
        units: 3,
        discount: 0,
        totalAmount: 5397,
      },
    ],
  }
];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  arriving: "bg-blue-50 text-blue-700 border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancel: "bg-red-50 text-red-700 border-red-100",
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const order = ORDERS.find((o) => o._id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <p className="font-serif text-2xl text-stone-400 italic">Order not found</p>
          <Link to="/orders" className="text-amber-700 font-bold uppercase tracking-widest text-xs underline">Return to Logs</Link>
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
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest uppercase">Detail Log</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
                Order <span className="italic text-amber-500">#{order._id.slice(-6)}</span>
              </h1>
              <p className="text-stone-400 text-sm font-medium">
                Confirmed Transaction • {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white gap-2 uppercase tracking-widest text-[10px] h-12 px-6">
              <Download size={14} /> Download Invoice
            </Button>
          </div>
        </div>
      </section>

      {/* --- Order Content --- */}
      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Items & Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Status Tracker */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 mb-8 flex items-center gap-2">
                <Truck size={16} /> Delivery Progress
              </h3>
              <div className="flex items-center justify-between relative">
                {/* Connection Line */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-stone-100 -z-0"></div>
                
                <StatusStep icon={<CheckCircle2 size={18}/>} label="Confirmed" sub="Sept 10" active />
                <StatusStep icon={<Package size={18}/>} label="Processing" sub="Sept 11" active />
                <StatusStep icon={<Truck size={18}/>} label="In Transit" sub="Pending" current={order.orderStatus === 'arriving'} />
                <StatusStep icon={<HomeIcon size={18}/>} label="Delivered" sub="Estimate: Sept 15" />
              </div>
            </div>

            {/* Items Manifest */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-sm font-serif font-bold">Product Manifest</h3>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{order.items.length} Units Total</span>
              </div>
              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-8 flex flex-col md:flex-row gap-6 items-center">
                    <div className="h-20 w-20 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-center text-stone-300">
                      <Package size={32} strokeWidth={1} />
                    </div>
                    <div className="flex-grow space-y-1 text-center md:text-left">
                      <h4 className="font-bold text-stone-800">{item.productName}</h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">SKU: {item.sku}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs text-stone-500 mb-1">₹{item.pricePerUnit} × {item.units}</p>
                      <p className="font-serif font-bold text-stone-900">₹{item.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Billing Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-stone-900 text-stone-50 rounded-2xl p-8 shadow-xl shadow-stone-200">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-amber-500 mb-8 flex items-center gap-2">
                <CreditCard size={16} /> Bill Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">Subtotal</span>
                  <span className="font-bold">₹{order.netBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">Shipping</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                </div>
                <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                  <span className="text-xs uppercase tracking-widest font-bold text-stone-400">Total Net</span>
                  <span className="text-3xl font-serif font-bold text-amber-500">₹{order.netBill.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-10 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2">Payment Method</p>
                <p className="text-xs font-bold flex items-center gap-2 italic">
                   {order.paymentMode === 'Online' ? 'Verified Digital Payment' : 'Cash on Delivery'}
                </p>
              </div>
            </div>

            <Link to="/orders" className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to History
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatusStep({ icon, label, sub, active = false, current = false }) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
        active ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 
        current ? 'bg-white border-amber-500 text-amber-500 scale-110' : 
        'bg-white border-stone-100 text-stone-300'
      }`}>
        {icon}
      </div>
      <div className="text-center">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active || current ? 'text-stone-900' : 'text-stone-400'}`}>{label}</p>
        <p className="text-[9px] text-stone-400 font-medium">{sub}</p>
      </div>
    </div>
  );
}