import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure you have axios installed: npm install axios
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Orders from Backend
  const fetchOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders/my", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("UserToken")}`, // or however you store it
        },
      });
      setOrders(response.data.orders);
      console.log(response.data.orders);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await axios.put(`/api/orders/cancel/${orderId}`); // Update with your actual endpoint
        // Refresh the list after cancellation
        fetchOrders();
        alert("Order cancelled successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Failed to cancel order");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">
              Order Logs
            </span>
          </nav>
          <h1 className="font-serif text-4xl font-bold mb-4">
            Order <span className="italic text-amber-500">History</span>
          </h1>
        </div>
      </section>

      <main className="flex-grow py-16">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400 flex items-center gap-2">
              <Receipt size={16} /> All Purchases ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-amber-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
              <p className="text-stone-500 italic">
                No project shipments found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status =
                  statusConfig[order.orderStatus] || statusConfig.pending;

                return (
                  <div
                    key={order._id}
                    className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-serif font-bold text-stone-900">
                              Order #{order._id.slice(-6)}
                            </span>
                            <div
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${status.style}`}
                            >
                              {status.icon} {status.label}
                            </div>
                          </div>
                          <p className="text-xs text-stone-400 mt-1">
                            Manifest Date:{" "}
                            {new Date(
                              order.orderDate || order.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-2xl font-serif font-bold text-amber-600">
                            ₹{order.netBill?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-stone-100">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                            Payment
                          </p>
                          <p className="text-sm font-bold text-stone-700 uppercase">
                            {order.paymentMode}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">
                            Actions
                          </p>
                          {/* --- CANCELLATION BUTTON --- */}
                          {order.orderStatus === "pending" ? (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase hover:text-red-800 transition-colors"
                            >
                              <Trash2 size={12} /> Cancel Order
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">
                              No actions available
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between">
                        <p className="text-[11px] text-stone-400 italic">
                          Expected transit: 3-5 days
                        </p>
                        <Link
                          to={`/orders/${order._id}`}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-900 group-hover:text-amber-600"
                        >
                          Inspection Details <ArrowRight size={14} />
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
