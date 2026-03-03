import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon, ChevronRight, Package, Clock, CheckCircle2,
  XCircle, Receipt, ArrowRight, Trash2, Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const statusConfig = {
  delivered: {
    label: "Delivered",
    icon: <CheckCircle2 size={12} />,
    style: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  cancel: {
    label: "Cancelled",
    icon: <XCircle size={12} />,
    style: "bg-red-50 text-red-700 border border-red-100",
  },
  pending: {
    label: "Processing",
    icon: <Clock size={12} />,
    style: "bg-amber-50 text-amber-700 border border-amber-100",
  },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await axios.put(`/api/orders/cancel/${orderId}`);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to cancel order");
      }
    }
  };

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
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            My Account
          </p>
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

          {loading ? (
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
                const status = statusConfig[order.orderStatus] || statusConfig.pending;
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
                              {status.icon} {status.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-2">
                            Placed:{" "}
                            {new Date(order.orderDate || order.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-700">
                            ₹{order.netBill?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Order Details Grid */}
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
                          {order.orderStatus === "pending" ? (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
                            >
                              <Trash2 size={12} /> Cancel Order
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