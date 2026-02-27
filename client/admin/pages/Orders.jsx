import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Eye, X, User, MapPin, Package, Calendar, 
  CreditCard, Phone, Mail, Hash, Printer, Clock, Loader2, Search
} from "lucide-react";
import { Button } from "../../src/ui/button.jsx";
import { useToast } from "../../src/hooks/useToast.jsx";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Date Filter State
  const [filterDate, setFilterDate] = useState("");
  const { toast } = useToast();

  // 1. Fetch Orders from Backend
  const fetchAllOrders = async () => {
    try {
      // setIsLoading(true);
      const token = localStorage.getItem("token"); // Ensure admin token is used
      const res = await axios.get("http://localhost:5000/api/orders/admin/getAll", {
        // headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders);
      console.log("Fetched Orders:", res.data);
    } catch (err) {
      toast({ title: "FETCH FAILED", description: "Could not retrieve order registry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // 2. Dynamic Date Filtering Logic
  const filteredOrders = useMemo(() => {
    if (!filterDate) return orders;
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === filterDate;
    });
  }, [orders, filterDate]);

  const totalRevenue = useMemo(() => 
    filteredOrders.reduce((acc, curr) => acc + (curr.netBill || 0), 0), 
  [filteredOrders]);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "arriving": return "bg-blue-50 text-blue-700 border-blue-100";
      case "pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "cancel": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-stone-50 text-stone-700 border-stone-100";
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
      <Loader2 className="animate-spin text-amber-600" size={40} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Registry...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Order Registry</h1>
          <p className="text-sm text-stone-500 mt-1 italic">Tracking customer acquisitions and material fulfillment.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* DATE FILTER INPUT */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-sm">
             <div className="px-4 py-1 text-center">
                <p className="text-[9px] font-bold text-stone-400 uppercase">Volume</p>
                <p className="text-lg font-bold text-stone-900">{filteredOrders.length}</p>
             </div>
             <div className="w-[1px] h-8 bg-stone-100"></div>
             <div className="px-4 py-1 text-center">
                <p className="text-[9px] font-bold text-stone-400 uppercase">Revenue</p>
                <p className="text-lg font-bold text-amber-600">₹{(totalRevenue / 1000).toFixed(1)}k</p>
             </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Order ID</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Consignee</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Manifest Date</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Net Bill</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="p-5 font-mono text-[10px] font-bold text-stone-400">#{order._id.slice(-8)}</td>
                <td className="p-5">
                  <span className="text-sm font-bold text-stone-900 block uppercase">{order.shippingAddress?.fullName || "Guest"}</span>
                  <span className="text-[10px] text-stone-400 font-mono">{order.paymentMode}</span>
                </td>
                <td className="p-5 text-xs font-medium text-stone-600">
                   {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}
                </td>
                <td className="p-5 text-sm font-bold text-amber-700">₹{order.netBill?.toLocaleString('en-IN')}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => handleViewDetail(order)}
                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-stone-900 text-white rounded-xl text-[9px] font-bold uppercase hover:bg-amber-600 transition-all shadow-md active:scale-95"
                  >
                    <Eye size={12} /> Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-20 text-center text-stone-400 italic text-sm">No transactions found for this period.</div>
        )}
      </div>

      {/* Detail Modal */}
      {/* Change this in your main return */}
{isDetailOpen && selectedOrder && (
  <OrderDetailModal 
    order={selectedOrder} 
    onClose={() => setIsDetailOpen(false)} 
    onRefresh={fetchAllOrders} // <--- Add this
  />
)}
    </div>
  );
};

/* --- UPDATED DYNAMIC MODAL COMPONENT --- */
const OrderDetailModal = ({ order, onClose, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.orderStatus);
  const { toast } = useToast();

  // 1. Update Status Function
  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/admin/update-status/${order._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({ title: "STATUS UPDATED", description: `Order is now marked as ${newStatus}.` });
      onRefresh(); // Refresh the main list
      onClose();   // Close modal
    } catch (err) {
      toast({ 
        title: "UPDATE FAILED", 
        description: err.response?.data?.message || "Could not update registry.", 
        variant: "destructive" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. Delete Order Function
  const handleDeleteOrder = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to delete this record? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/orders/admin/delete/${order._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "RECORD DELETED", description: "Order has been removed from registry." });
      onRefresh();
      onClose();
    } catch (err) {
      toast({ title: "DELETE FAILED", description: "Authorization required.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-900 rounded-2xl text-amber-500 shadow-lg">
                <Package size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Material Manifest</p>
              <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">{order._id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400"><X size={24} /></button>
        </div>

        {/* Modal Body (Kept your original layout) */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Column 1: Client & Logistics */}
            <div className="space-y-10">
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Client Profile</h3>
                <div className="p-5 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-stone-900 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                        {order.shippingAddress?.fullName?.charAt(0)}
                    </div>
                    <p className="text-sm font-bold text-stone-900 uppercase">{order.shippingAddress?.fullName}</p>
                  </div>
                  <div className="space-y-3 pt-3 border-t border-stone-200/50">
                    <div className="flex items-center gap-3 text-stone-600"><Phone size={14} className="text-amber-600"/> <span className="text-xs font-medium">{order.shippingAddress?.contact}</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Status Management</h3>
                <div className="p-5 bg-white border border-stone-200 rounded-3xl space-y-3">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Current Status</p>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="arriving">Arriving</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancel">Cancel</option>
                  </select>
                </div>
              </section>
            </div>

            {/* Column 2 & 3: Order Details */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Architectural Selection</h3>
                <div className="border border-stone-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-stone-50 text-[9px] uppercase font-bold text-stone-400 tracking-widest">
                      <tr>
                        <th className="p-4 text-left">Spec</th>
                        <th className="p-4 text-center">Units</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {order.items?.map((item, i) => (
                        <tr key={i} className="text-xs">
                          <td className="p-4">
                            <p className="font-bold text-stone-800 uppercase">{item.productName}</p>
                          </td>
                          <td className="p-4 text-center font-bold text-stone-600">{item.units || item.quantity}</td>
                          <td className="p-4 text-right font-bold text-stone-900">₹{item.totalAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="p-6 bg-stone-900 rounded-3xl text-white flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[9px] font-bold text-amber-500 uppercase mb-1 tracking-widest">Net Settlement</p>
                  <p className="text-2xl font-serif font-black">₹{order.netBill?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.print()} className="p-2 hover:bg-stone-800 rounded-lg transition-colors">
                        <Printer className="text-stone-400" size={20} />
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
          <button 
            onClick={handleDeleteOrder}
            className="text-[10px] font-bold uppercase text-rose-500 hover:text-rose-700 tracking-widest transition-colors"
          >
            Delete Record
          </button>
          
          <div className="flex gap-3">
            <Button 
                variant="outline" 
                onClick={onClose}
                className="rounded-xl text-[10px] h-10 px-6 uppercase font-bold tracking-widest"
            >
                Cancel
            </Button>
            <Button 
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === order.orderStatus}
                className="bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-[10px] h-10 px-8 uppercase font-bold tracking-widest transition-all min-w-[160px]"
            >
                {isUpdating ? <Loader2 className="animate-spin" size={14} /> : "Update Fulfillment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;