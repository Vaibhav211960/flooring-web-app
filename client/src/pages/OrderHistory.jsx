import React from "react";
import { Link } from "react-router-dom";
import { 
  Home as HomeIcon, 
  ChevronRight, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Receipt,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const orderHistory = [
  {
    _id: "ORD123401",
    orderDate: "2025-07-12",
    orderStatus: "delivered",
    paymentMode: "Online",
    netBill: 8999,
    itemsCount: 3,
  },
  {
    _id: "ORD123402",
    orderDate: "2025-06-28",
    orderStatus: "delivered",
    paymentMode: "COD",
    netBill: 4599,
    itemsCount: 1,
  },
  {
    _id: "ORD123403",
    orderDate: "2025-06-10",
    orderStatus: "cancel",
    paymentMode: "Online",
    netBill: 12999,
    itemsCount: 4,
  },
];

const statusConfig = {
  delivered: {
    label: "Dispatched & Delivered",
    icon: <CheckCircle2 size={14} />,
    style: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  cancel: {
    label: "Voided / Cancelled",
    icon: <XCircle size={14} />,
    style: "bg-red-50 text-red-700 border-red-100",
  },
  pending: {
    label: "Processing",
    icon: <Clock size={14} />,
    style: "bg-amber-50 text-amber-700 border-amber-100",
  }
};

export default function OrderHistory() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* --- Page Header --- */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/profile" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">Order Logs</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Order <span className="italic text-amber-500">History</span>
            </h1>
            <p className="text-stone-400 text-sm leading-relaxed max-w-lg">
              Detailed logs of your architectural acquisitions and project shipments.
            </p>
          </div>
        </div>
      </section>

      {/* --- Orders List --- */}
      <main className="flex-grow py-16">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 flex items-center gap-2">
              <Receipt size={16} /> All Purchases ({orderHistory.length})
            </h2>
          </div>

          <div className="space-y-6">
            {orderHistory.map((order) => {
              const status = statusConfig[order.orderStatus] || statusConfig.pending;
              
              return (
                <div
                  key={order._id}
                  className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6 md:p-8">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-serif font-bold text-stone-900 tracking-tight">
                            Order #{order._id.slice(-6)}
                          </span>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.style}`}>
                            {status.icon} {status.label}
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 font-medium">
                          Manifest Date: {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Net Total</p>
                        <p className="text-2xl font-serif font-bold text-amber-600">₹{order.netBill.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-stone-100">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Item Count</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
                          <Package size={16} className="text-stone-300" />
                          {order.itemsCount} {order.itemsCount > 1 ? 'Units' : 'Unit'}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Payment Method</p>
                        <p className="text-sm font-bold text-stone-700 uppercase tracking-tighter">{order.paymentMode}</p>
                      </div>

                      <div className="hidden md:block">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Invoice</p>
                        <button className="text-[10px] font-bold text-amber-700 uppercase hover:underline">Download PDF</button>
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="mt-8 flex items-center justify-between">
                       <p className="text-[11px] text-stone-400 italic">Expected transit time: 3-5 business days</p>
                       <Link 
                        to={`/orders/${order._id}`}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 group-hover:text-amber-600 transition-colors"
                       >
                        Inspection Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}