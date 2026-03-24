import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon, ChevronRight, Package, Clock,
  ExternalLink, Loader2, ShoppingBag, MapPin,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import { getStatusConfig } from "../utils/validators";

export default function OrdersTracking() {
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/orders/my");
      setOrders(data.orders || []);
    } catch {
      // Silent — user sees empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Active Shipments</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">Live Tracking</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
            Track your <span className="italic text-amber-400">Orders</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-md font-medium leading-relaxed">
            Monitor the progress of your architectural materials from our warehouse to your project site.
          </p>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-5xl mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">In-Transit Materials</p>
            <Link to="/order-history" className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 hover:underline">
              View Past Logs
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 text-amber-600 animate-spin mb-4" />
              <p className="text-stone-400 text-sm italic tracking-widest">Loading Logs...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-stone-400" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">No Active Orders</h3>
              <p className="text-stone-500 text-sm">You have no shipments currently in transit.</p>
              <Link to="/products" className="mt-5 inline-block text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] hover:underline">
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const rawStatus  = (order.orderStatus || "pending").toLowerCase();
              const statusCfg  = getStatusConfig(rawStatus);
              const price      = order.netBill || 0;
              const itemsCount = order.items?.length || 0;

              return (
                <div key={order._id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-amber-200 hover:shadow-md transition-all duration-300">
                  <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusCfg.style}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400 font-bold">Ref: #{order._id.slice(-6)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                      <Clock size={12} className={rawStatus === "delivered" ? "text-emerald-500" : "text-amber-500"} />
                      {rawStatus === "delivered" ? "Completed: " : "Placed: "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-4 flex items-center gap-4">
                      <div className="h-14 w-14 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                        <Package size={22} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{itemsCount} {itemsCount > 1 ? "Items" : "Item"}</p>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Net: ₹{price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="md:col-span-4 flex items-start gap-3 md:border-l md:border-stone-100 md:pl-8">
                      <MapPin size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400 mb-1">Destination</p>
                        <p className="text-xs font-medium text-stone-700 leading-tight line-clamp-2 uppercase italic">
                          {order.shippingAddress?.address || "Address not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end">
                      <Link to={`/orders/${order._id}`} className="w-full md:w-auto">
                        <button className="w-full px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                          Full Details <ExternalLink size={12} />
                        </button>
                      </Link>
                    </div>
                  </div>

                  <div className="h-1 w-full bg-stone-100 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${
                      rawStatus === "delivered"  ? "w-full bg-emerald-500"
                      : rawStatus === "arriving" ? "w-2/3 bg-amber-500"
                      : rawStatus === "cancelled" || rawStatus === "cancel" ? "w-full bg-red-500"
                      : "w-1/3 bg-amber-500"
                    }`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}