import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Home as HomeIcon, ChevronRight, MapPin, Package, 
  Clock, ExternalLink, Loader2 
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  arriving: "bg-blue-50 text-blue-700 border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancel: "bg-red-50 text-red-700 border-red-100",
};

const getStatusText = (status) => {
  const s = status?.toLowerCase();
  switch(s) {
    case 'arriving': return 'Out for Delivery';
    case 'pending': return 'Awaiting Fulfillment';
    case 'delivered': return 'Delivered';
    case 'cancel': return 'Cancelled';
    default: return status;
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Replace with your actual API endpoint
        const { data } = await axios.get("http://localhost:5000/api/orders/my", {
            headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` }
        });
        setOrders(data.orders);
        console.log(data.orders);
        
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

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
          <p className="text-stone-400 text-sm max-w-md font-medium leading-relaxed">
            Monitor the progress of your architectural materials from our warehouse to your project site.
          </p>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-5xl mx-auto px-6 space-y-8">
          
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">In-Transit Materials</h2>
              <Link to="/order-history" className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 hover:underline">View Past Logs</Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-amber-600" size={32} />
                <p className="text-stone-400 text-xs uppercase tracking-widest">Loading Logs...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300">
              <p className="text-stone-500 italic">No active orders found.</p>
            </div>
          ) : (
            orders.map((order) => {
              // Normalize status for styling
              const rawStatus = (order.orderStatus || order.status || 'pending').toLowerCase();
              const price = order.netBill || order.totalAmount || 0;
              const destination = order.shippingAddress.address || "Address not specified";
              const itemsCount = order.itemsCount || (order.items ? order.items.length : 0);
              const displayDate = new Date(order.createdAt).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
              });

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden group hover:border-amber-300 transition-all duration-300"
                >
                  {/* Status Header */}
                  <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusStyles[rawStatus] || statusStyles.pending}`}>
                        {getStatusText(rawStatus)}
                      </div>
                      <span className="text-xs font-mono text-stone-400">Ref: #{order._id.slice(-6)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                      <Clock size={14} className={rawStatus === 'delivered' ? "text-emerald-500" : "text-amber-500"} />
                      {rawStatus === 'delivered' ? 'Completion: ' : 'Placed On: '} {displayDate}
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Product Summary */}
                    <div className="md:col-span-4 flex items-center gap-4">
                      <div className="h-16 w-16 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{itemsCount} {itemsCount > 1 ? 'Items' : 'Industrial Item'}</p>
                        <p className="text-xs text-stone-500 font-mono font-medium">Net: ₹{price.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Shipping Destination */}
                    <div className="md:col-span-4 flex items-start gap-3 border-stone-100 md:border-l md:pl-8">
                      <MapPin size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Destination</p>
                        <p className="text-xs font-medium text-stone-700 leading-tight line-clamp-2 uppercase italic">{destination}</p>
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
                  
                  {/* Progress Bar Logic */}
                  <div className="h-1 w-full bg-stone-100 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 
                        ${rawStatus === 'delivered' ? 'w-full bg-emerald-500' : 
                          rawStatus === 'arriving' ? 'w-2/3 bg-amber-500' : 
                          rawStatus === 'cancel' ? 'w-full bg-red-500' : 'w-1/3 bg-amber-500'}`}
                    />
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