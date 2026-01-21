import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, Filter, MoreVertical, Ban, CheckCircle, Mail, UserPlus, 
  X, Phone, MapPin, Calendar, ShoppingBag, CreditCard, Hash, ExternalLink 
} from "lucide-react";

// --- 1. DUMMY DATA (5 ENTRIES) ---
export const customerData = [
  {
    id: "USR-101",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 99887 76655",
    address: "C-12, Green Park, New Delhi, 110016",
    orders: 2,
    spent: 12495,
    status: "active",
    joinedAt: "12 Oct, 2024",
    orderHistory: [
      { id: "ORD-1001", date: "Dec 18, 2024", amount: 7497, status: "Delivered" },
      { id: "ORD-0985", date: "Nov 05, 2024", amount: 4998, status: "Delivered" }
    ]
  },
  {
    id: "USR-102",
    name: "Anjali Patel",
    email: "anjali@gmail.com",
    phone: "+91 88776 65544",
    address: "402, Lotus Residency, Satellite, Ahmedabad",
    orders: 1,
    spent: 4998,
    status: "active",
    joinedAt: "01 Nov, 2024",
    orderHistory: [
      { id: "ORD-1002", date: "Dec 17, 2024", amount: 2499, status: "Shipped" }
    ]
  },
  {
    id: "USR-103",
    name: "Amit Verma",
    email: "amit@gmail.com",
    phone: "+91 77665 54433",
    address: "Plot 45, Sector 18, Gurgaon, Haryana",
    orders: 1,
    spent: 1799,
    status: "blocked",
    joinedAt: "18 Nov, 2024",
    orderHistory: [
      { id: "ORD-1003", date: "Dec 15, 2024", amount: 1799, status: "Cancelled" }
    ]
  },
  {
    id: "USR-104",
    name: "Sneha Joshi",
    email: "sneha@gmail.com",
    phone: "+91 90011 22334",
    address: "B-501, Hill View, Kothrud, Pune",
    orders: 1,
    spent: 8500,
    status: "active",
    joinedAt: "25 Sep, 2024",
    orderHistory: [
      { id: "ORD-0882", date: "Sep 30, 2024", amount: 2125, status: "Delivered" }
    ]
  },
  {
    id: "USR-105",
    name: "Vikram Malhotra",
    email: "vikram@outlook.com",
    phone: "+91 99999 88888",
    address: "15, Marine Drive, Mumbai, Maharashtra",
    orders: 1,
    spent: 45200,
    status: "active",
    joinedAt: "10 Aug, 2024",
    orderHistory: [
      { id: "ORD-0771", date: "Jan 05, 2025", amount: 15400, status: "Processing" }
    ]
  }
];

const Customers = () => {
  const [customers, setCustomers] = useState(customerData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* --- BACKEND INTEGRATION (COMMENTED OUT) ---
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const updateCustomerStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(`http://localhost:5000/api/users/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // fetchCustomers();
    } catch (err) { console.error("Update failed", err); }
  };

  useEffect(() => {
    // fetchCustomers();
  }, []);
  ------------------------------------------- */

  const toggleStatus = (id) => {
    setCustomers(
      customers.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "blocked" : "active" }
          : user
      )
    );
  };

  const openUserDetail = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* --- Page Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Client Registry</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Manage your relationship with homeowners and architects.
          </p>
        </div>
      </div>

      {/* --- Filters Bar --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100 flex-1 min-w-[280px]">
          <Search size={16} className="text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="bg-transparent outline-none text-xs font-medium text-stone-600 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Client Table --- */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Client Info</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Activity</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Total Revenue</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Account Status</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Registry Date</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => openUserDetail(user)}>
                      <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors underline-offset-4 decoration-stone-200">{user.name}</p>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <p className="text-sm font-medium text-stone-700">{user.orders} Orders</p>
                  </td>

                  <td className="p-5">
                    <p className="text-sm font-serif font-bold text-stone-900">₹{user.spent.toLocaleString()}</p>
                  </td>

                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      user.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {user.status}
                    </span>
                  </td>

                  <td className="p-5 text-xs text-stone-500 font-medium">{user.joinedAt}</td>

                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'active' 
                            ? 'text-stone-400 hover:bg-rose-50 hover:text-rose-600' 
                            : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                        title={user.status === 'active' ? 'Block Client' : 'Unblock Client'}
                      >
                        {user.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CLIENT DETAIL MODAL --- */}
      {isModalOpen && selectedUser && (
        <CustomerDetailModal 
          user={selectedUser} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

/* --- MODAL SUB-COMPONENT --- */
const CustomerDetailModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-stone-900 text-amber-500 flex items-center justify-center font-bold text-xl">
                {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Client Profile</p>
              <h2 className="text-2xl font-serif font-bold text-stone-900">{user.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Orders</p>
                <p className="text-xl font-bold text-stone-900 mt-1">{user.orders}</p>
             </div>
             <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Total Spent</p>
                <p className="text-xl font-serif font-bold text-stone-900 mt-1">₹{user.spent.toLocaleString()}</p>
             </div>
             <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Since</p>
                <p className="text-sm font-bold text-stone-900 mt-2">{user.joinedAt.split(',')[1]}</p>
             </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                Contact Information
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                   <div className="p-2 bg-white rounded-lg text-stone-400"><Mail size={16}/></div>
                   <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase">Email Address</p>
                      <p className="text-sm font-bold text-stone-800">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                   <div className="p-2 bg-white rounded-lg text-stone-400"><Phone size={16}/></div>
                   <div>
                      <p className="text-[9px] font-bold text-stone-400 uppercase">Phone Number</p>
                      <p className="text-sm font-bold text-stone-800">{user.phone}</p>
                   </div>
                </div>
             </div>
             <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="p-2 bg-white rounded-lg text-stone-400 mt-1"><MapPin size={16}/></div>
                <div>
                   <p className="text-[9px] font-bold text-stone-400 uppercase">Shipping Address</p>
                   <p className="text-sm font-medium text-stone-700 leading-relaxed mt-1">{user.address}</p>
                </div>
             </div>
          </div>

          {/* Recent Order History */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Recent Activity</h4>
             <div className="border border-stone-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                   <thead className="bg-stone-50 border-b border-stone-100">
                      <tr>
                         <th className="p-4 font-bold text-stone-400">Order ID</th>
                         <th className="p-4 font-bold text-stone-400">Date</th>
                         <th className="p-4 font-bold text-stone-400 text-right">Amount</th>
                         <th className="p-4 font-bold text-stone-400 text-center">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                      {user.orderHistory.map((order, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                           <td className="p-4 font-bold text-stone-900">{order.id}</td>
                           <td className="p-4 text-stone-500">{order.date}</td>
                           <td className="p-4 text-right font-bold text-stone-900">₹{order.amount.toLocaleString()}</td>
                           <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[9px] font-bold uppercase text-stone-600">
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
          <button className="px-6 py-2 bg-white border border-stone-200 text-stone-600 rounded-xl text-[10px] font-bold uppercase hover:bg-stone-100 transition-all">Export PDF</button>
          <button className="px-6 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-amber-600 transition-all shadow-lg">Contact Client</button>
        </div>
      </div>
    </div>
  );
};

export default Customers;