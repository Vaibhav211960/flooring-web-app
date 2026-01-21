import React from "react";
import { Link } from "react-router-dom";
import { 
  Home as HomeIcon, 
  ChevronRight, 
  Truck, 
  MapPin, 
  Package, 
  ArrowRight,
  Clock,
  ExternalLink
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const orders = [
  {
    _id: "ORD123456",
    orderDate: "2025-09-10",
    orderStatus: "arriving",
    estimatedDelivery: "Sept 15, 2025",
    paymentMode: "Online",
    netBill: 10195,
    itemsCount: 2,
    shippingTo: "Prahladnagar, Ahmedabad"
  },
  {
    _id: "ORD123457",
    orderDate: "2025-09-05",
    orderStatus: "pending",
    estimatedDelivery: "Sept 18, 2025",
    paymentMode: "COD",
    netBill: 8499,
    itemsCount: 3,
    shippingTo: "Prahladnagar, Ahmedabad"
  }
];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  arriving: "bg-blue-50 text-blue-700 border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function Orders() {
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
            <span className="text-amber-500 font-bold tracking-widest uppercase text-[10px]">Active Shipments</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Track your <span className="italic text-amber-500">Orders</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-md">
            Monitor the progress of your architectural materials from our warehouse to your project site.
          </p>
        </div>
      </section>

      {/* --- Orders Tracking List --- */}
      <main className="flex-grow py-12">
        <div className="container max-w-5xl mx-auto px-6 space-y-8">
          
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
             <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">In-Transit Materials</h2>
             <Link to="/order-history" className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 hover:underline">View Past Logs</Link>
          </div>

          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-amber-300 transition-all duration-300"
            >
              {/* Status Header */}
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[order.orderStatus]}`}>
                    {order.orderStatus === 'arriving' ? 'Out for Delivery' : 'Awaiting Fulfillment'}
                  </div>
                  <span className="text-xs font-mono text-stone-400">Ref: #{order._id.slice(-6)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                  <Clock size={14} className="text-amber-500" />
                  Est. Arrival: {order.estimatedDelivery}
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Product Summary */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="h-16 w-16 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{order.itemsCount} Industrial Items</p>
                    <p className="text-xs text-stone-500">Net: ₹{order.netBill.toLocaleString()}</p>
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="md:col-span-4 flex items-start gap-3">
                  <MapPin size={18} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Destination</p>
                    <p className="text-xs font-medium text-stone-700 leading-tight">{order.shippingTo}</p>
                  </div>
                </div>

                {/* Tracking Action */}
                <div className="md:col-span-4 flex flex-col sm:flex-row md:justify-end gap-3">
                  <Link to={`/orders/${order._id}`} className="w-full sm:w-auto">
                    <button className="w-full px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                      Full Details <ExternalLink size={12} />
                    </button>
                  </Link>
                </div>

              </div>
              
              {/* Progress Bar (Visual Only) */}
              <div className="h-1 w-full bg-stone-100 overflow-hidden">
                <div 
                  className={`h-full bg-amber-500 transition-all duration-1000 ${order.orderStatus === 'arriving' ? 'w-2/3' : 'w-1/3'}`}
                />
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Package size={48} className="mx-auto text-stone-200" strokeWidth={1} />
              <p className="font-serif text-xl text-stone-400 italic">No active shipments found.</p>
              <Link to="/categories">
                <button className="mt-4 px-8 py-3 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl">Start Shopping</button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}