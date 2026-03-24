import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Home as HomeIcon, ChevronRight, Package, Receipt,
  ArrowRight, Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";
import { getStatusConfig } from "../utils/validators";

export default function OrderHistory() {
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // useCallback: stable fetch reference
  // FIX: was plain async — needed for optimistic cancel revert
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/orders/my");
      // Sort newest first
      const sorted = [...(res.data.orders || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sorted);
    } catch {
      // FIX: was console.error — silent failure, user saw nothing
      toast.error("Could not load orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // FIX 1: was window.confirm() — breaks design, can't be styled
  // FIX 2: was calling wrong URL "/api/orders/cancel/:id" (relative, missing base)
  // FIX 3: was calling fetchOrders() after cancel — now uses optimistic update
  const handleCancelOrder = useCallback((orderId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">
            Cancel this order? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                // Optimistic update — instantly show cancelled in UI
                setOrders((prev) =>
                  prev.map((o) =>
                    o._id === orderId ? { ...o, orderStatus: "cancelled" } : o
                  )
                );
                try {
                  await api.put(`/orders/cancel/${orderId}`);
                  toast.success("Order cancelled.");
                } catch (err) {
                  // Revert on failure
                  setOrders((prev) =>
                    prev.map((o) =>
                      o._id === orderId ? { ...o, orderStatus: "pending" } : o
                    )
                  );
                  toast.error(err.response?.data?.message || "Failed to cancel order.");
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
            >Confirm</button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
            >Keep Order</button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/profile" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Orders</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">My Account</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Order <span className="italic text-amber-400">History</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <Receipt size={14} />
              <span>All Purchases ({orders.length})</span>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-amber-700 transition-colors"
            >
              ← Back to Profile
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-amber-600 h-8 w-8 mb-4" />
              <p className="text-stone-400 text-sm italic tracking-widest">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-stone-200">
              <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-stone-300" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">No orders yet</h3>
              <p className="text-stone-500 text-sm mb-6">You haven't placed any orders.</p>
              <Link
                to="/products"
                className="text-amber-700 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-amber-600 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => {
                // FIX: was using "cancel" key — getStatusConfig handles both "cancel" and "cancelled"
                const status = getStatusConfig(order.orderStatus);
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pb-6 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-serif font-bold text-stone-900">
                              Order #{order._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${status.style}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
                            Placed:{" "}
                            {new Date(order.orderDate || order.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-700">
                            ₹{order.netBill?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1.5">Payment</p>
                          <p className="text-sm font-bold text-stone-800 uppercase">{order.paymentMode}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1.5">Delivery</p>
                          <p className="text-sm font-semibold text-stone-600 italic">3–5 business days</p>
                        </div>
                        <div className="md:col-span-2 flex items-end">
                          {/* Only show cancel for pending orders */}
                          {order.orderStatus === "pending" ? (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
                            >
                              Cancel Order
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">No actions available</span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-end pt-4 border-t border-stone-100">
                        <Link
                          to={`/orders/${order._id}`}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-amber-700 transition-colors"
                        >
                          View Details <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}