import React, { useState } from "react";
import { 
  Eye, X, User, MapPin, Package, Calendar, 
  CreditCard, Phone, Mail, Hash, Printer, Clock
} from "lucide-react";

const Orders = () => {
  // --- 1. Dummy Data Array ---
  const [orders, setOrders] = useState([
    {
      _id: "ORD678901",
      customerName: "john snow",
      customerEmail: "john123@example.com",
      customerPhone: "+91 98765 43210",
      address: "d-102 , nikol gam , ahmedabad",
      totalAmount: 1819,
      status: "Pending",
      createdAt: "2026-01-18T10:30:00Z",
      items: [
        { productName: "digital wall tiles", quantity: 16, price: 95, unit: "sqft", woodType: "Oak" },
      ]
    },
    {
      _id: "ORD678902",
      customerName: "Priya Sharma",
      customerEmail: "priya.sharma@outlook.com",
      customerPhone: "+91 88221 12233",
      address: "12/A, Skyview Towers, Sector 44, Gurgaon, Haryana - 122003",
      totalAmount: 12500,
      status: "Shipped",
      createdAt: "2026-01-19T14:20:00Z",
      items: [
        { productName: "Walnut Matte Finish", quantity: 50, price: 250, unit: "sqft", woodType: "Walnut" }
      ]
    },
    {
      _id: "ORD678903",
      customerName: "Rajesh Khanna",
      customerEmail: "r.khanna@gmail.com",
      customerPhone: "+91 77665 54433",
      address: "Plot 88, JP Nagar 2nd Phase, Bangalore, Karnataka - 560078",
      totalAmount: 89000,
      status: "Delivered",
      createdAt: "2026-01-15T09:15:00Z",
      items: [
        { productName: "Teak Wood Blocks", quantity: 400, price: 200, unit: "sqft", woodType: "Teak" },
        { productName: "Adhesive Pro", quantity: 3, price: 3000, unit: "box", woodType: "N/A" }
      ]
    },
    {
      _id: "ORD678904",
      customerName: "Vikram Singh",
      customerEmail: "vikram.v@singh.in",
      customerPhone: "+91 90000 11111",
      address: "House 4, Civil Lines, Jaipur, Rajasthan - 302006",
      totalAmount: 32000,
      status: "Cancelled",
      createdAt: "2026-01-20T08:00:00Z",
      items: [
        { productName: "Maple Wood Slabs", quantity: 100, price: 320, unit: "plank", woodType: "Maple" }
      ]
    },
    {
      _id: "ORD678905",
      customerName: "Sanya Iyer",
      customerEmail: "sanya.i@lifestyle.com",
      customerPhone: "+91 91234 56789",
      address: "C-602, Marina Drive Apartments, Kochi, Kerala - 682018",
      totalAmount: 15400,
      status: "Pending",
      createdAt: "2026-01-20T11:45:00Z",
      items: [
        { productName: "Bamboo Eco-Plank", quantity: 70, price: 220, unit: "sqft", woodType: "Bamboo" }
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Shipped": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Cancelled": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-stone-50 text-stone-700 border-stone-100";
    }
  };

  return (
    <div className="p-8 space-y-8 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Order Registry</h1>
          <p className="text-sm text-stone-500 mt-1 italic">Tracking customer acquisitions and material fulfillment.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-stone-200">
           <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase">Active Orders</p>
              <p className="text-xl font-bold text-stone-900">{orders.filter(o => o.status !== 'Delivered').length}</p>
           </div>
           <div className="w-[1px] h-8 bg-stone-100"></div>
           <div className="px-4 py-2 text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase">Revenue</p>
              <p className="text-xl font-bold text-stone-900">₹1.9L</p>
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Order Ref</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Customer Info</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Date</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Amount</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-stone-50/50 transition-colors">
                <td className="p-5 font-mono text-xs font-bold text-stone-400">{order._id}</td>
                <td className="p-5">
                  <span className="text-sm font-bold text-stone-900 block">{order.customerName}</span>
                  <span className="text-[11px] text-stone-500">{order.customerEmail}</span>
                </td>
                <td className="p-5 text-sm text-stone-600">
                   {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="p-5 text-sm font-bold text-stone-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => handleViewDetail(order)}
                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-amber-600 transition-all shadow-md"
                  >
                    <Eye size={14} /> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setIsDetailOpen(false)} 
        />
      )}
    </div>
  );
};

/* --- MODAL COMPONENT --- */
const OrderDetailModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-900 rounded-2xl text-amber-500">
                <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Transaction Details</p>
              <h2 className="text-xl font-bold text-stone-900">{order._id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column: Customer & Shipping */}
            <div className="space-y-8">
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Customer Profile</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-stone-200 font-bold text-stone-400">
                        {order.customerName.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-stone-900">{order.customerName}</p>
                        <p className="text-xs text-stone-500 italic">Registered Buyer</p>
                    </div>
                  </div>
                  <div className="space-y-2 px-2">
                    <div className="flex items-center gap-3 text-stone-600"><Mail size={14}/> <span className="text-xs">{order.customerEmail}</span></div>
                    <div className="flex items-center gap-3 text-stone-600"><Phone size={14}/> <span className="text-xs">{order.customerPhone}</span></div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Delivery Address</h3>
                <div className="p-5 bg-stone-50 rounded-2xl border-l-4 border-stone-900 relative">
                  <MapPin size={16} className="absolute top-5 right-5 text-stone-300"/>
                  <p className="text-xs leading-relaxed text-stone-600 font-medium">
                    {order.address}
                  </p>
                </div>
              </section>
            </div>

            {/* Middle & Right Column: Items and Summary */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Order Breakdown</h3>
                <div className="border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="p-4 text-[10px] text-stone-400 uppercase font-bold text-left">Product</th>
                        <th className="p-4 text-[10px] text-stone-400 uppercase font-bold text-center">Qty</th>
                        <th className="p-4 text-[10px] text-stone-400 uppercase font-bold text-right">Price</th>
                        <th className="p-4 text-[10px] text-stone-400 uppercase font-bold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {order.items.map((item, i) => (
                        <tr key={i}>
                          <td className="p-4">
                            <p className="text-sm font-bold text-stone-800">{item.productName}</p>
                            <p className="text-[10px] text-stone-400 uppercase">{item.woodType} Flooring</p>
                          </td>
                          <td className="p-4 text-center text-xs font-bold text-stone-600">{item.quantity} {item.unit}</td>
                          <td className="p-4 text-right text-xs text-stone-500">₹{item.price}</td>
                          <td className="p-4 text-right text-sm font-bold text-stone-900">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Payment Status</p>
                        <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <CreditCard size={14} className="text-stone-400"/> Prepaid Online
                        </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 </div>
                 <div className="p-6 bg-amber-500 rounded-2xl text-stone-900 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-stone-800 uppercase mb-1">Final Settlement</p>
                        <p className="text-2xl font-serif font-black">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <Printer className="opacity-30" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-stone-500">
            <Clock size={14}/>
            <span className="text-[10px] font-bold uppercase">Ordered on {new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-[10px] font-bold uppercase hover:bg-stone-100 transition-all">Download PDF</button>
            <button className="px-6 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-amber-600 transition-all shadow-lg">Ship Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;