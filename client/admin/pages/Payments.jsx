import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, User, IndianRupee, ArrowUpRight, 
  CheckCircle2, Clock, AlertCircle, Copy, Search, 
  X, MapPin, Package, Calendar, Hash, Mail, Phone, ExternalLink
} from "lucide-react";

// --- 1. DUMMY DATA (5 ENTRIES) ---
const paymentData = [
  {
    id: "PAY-9001",
    orderId: "ORD-1001",
    customer: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 99887 76655",
    address: "C-12, Green Park, New Delhi, 110016",
    amount: 7497,
    method: "UPI",
    status: "success",
    transactionId: "TXN123456789",
    paidAt: "Dec 18, 2024",
    items: [
      { name: "Teak Polish", qty: 3, price: 2499 }
    ]
  },
  {
    id: "PAY-9002",
    orderId: "ORD-1002",
    customer: "Anjali Patel",
    email: "anjali@gmail.com",
    phone: "+91 88776 65544",
    address: "402, Lotus Residency, Satellite, Ahmedabad",
    amount: 2499,
    method: "Card",
    status: "success",
    transactionId: "TXN987654321",
    paidAt: "Dec 17, 2024",
    items: [
      { name: "Sanding Disc P80", qty: 10, price: 249.9 }
    ]
  },
  {
    id: "PAY-9003",
    orderId: "ORD-1003",
    customer: "Amit Verma",
    email: "amit@gmail.com",
    phone: "+91 77665 54433",
    address: "Plot 45, Sector 18, Gurgaon, Haryana",
    amount: 3598,
    method: "Net Banking",
    status: "failed",
    transactionId: "TXN555222111",
    paidAt: "Dec 15, 2024",
    items: [
      { name: "Wood Adhesive 5kg", qty: 2, price: 1799 }
    ]
  },
  {
    id: "PAY-9004",
    orderId: "ORD-1004",
    customer: "Sneha Joshi",
    email: "sneha@gmail.com",
    phone: "+91 90011 22334",
    address: "B-501, Hill View, Kothrud, Pune",
    amount: 1799,
    method: "UPI",
    status: "pending",
    transactionId: "TXN000888777",
    paidAt: "Dec 19, 2024",
    items: [
      { name: "Oak Varnish Small", qty: 1, price: 1799 }
    ]
  },
  {
    id: "PAY-9005",
    orderId: "ORD-1005",
    customer: "Vikram Malhotra",
    email: "vikram@outlook.com",
    phone: "+91 99999 88888",
    address: "15, Marine Drive, Mumbai, Maharashtra",
    amount: 15400,
    method: "UPI",
    status: "success",
    transactionId: "TXN444333222",
    paidAt: "Jan 05, 2025",
    items: [
      { name: "Premium Oak Plank", qty: 100, price: 154 }
    ]
  }
];

const Payments = () => {
  const [payments, setPayments] = useState(paymentData);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* --- BACKEND INTEGRATION (COMMENTED OUT FOR NOW) --- 
  
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.payments);
    } catch (err) {
      console.error("Failed to load ledger", err);
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`http://localhost:5000/api/payments/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPayments(); // Refresh list
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  useEffect(() => {
    // fetchPayments(); 
  }, []);

  -------------------------------------------------- */

  const getStatusConfig = (status) => {
    switch (status) {
      case "success":
        return { 
          style: "bg-emerald-50 text-emerald-700 border-emerald-100", 
          icon: <CheckCircle2 size={12} />,
          label: "Settled"
        };
      case "pending":
        return { 
          style: "bg-amber-50 text-amber-700 border-amber-100", 
          icon: <Clock size={12} />,
          label: "Awaiting"
        };
      case "failed":
        return { 
          style: "bg-rose-50 text-rose-700 border-rose-100", 
          icon: <AlertCircle size={12} />,
          label: "Declined"
        };
      default:
        return { style: "bg-stone-100 text-stone-500 border-stone-200", icon: null, label: status };
    }
  };

  const openDetail = (pay) => {
    setSelectedPayment(pay);
    setIsModalOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Financial Ledger</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">Audit-ready transaction logs for all studio revenue.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
           <div className="px-4 py-1.5 bg-white rounded-lg shadow-sm border border-stone-200">
              <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Total Settlement</p>
              <p className="text-sm font-serif font-bold text-stone-900 flex items-center gap-0.5"><IndianRupee size={12}/> 30,795</p>
           </div>
           <div className="px-4 py-1.5">
              <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Failures</p>
              <p className="text-sm font-serif font-bold text-rose-600">1</p>
           </div>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Internal Ref</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Order ID</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Client Info</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Method</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Amount</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Settlement</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Gateway ID</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-sm">
            {payments.map((pay) => {
              const config = getStatusConfig(pay.status);
              return (
                <tr key={pay.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-5 font-mono text-[11px] font-bold text-stone-400">{pay.id}</td>
                  
                  <td className="p-5">
                    <button 
                      onClick={() => openDetail(pay)}
                      className="flex items-center gap-1.5 text-stone-900 font-bold hover:text-amber-700 transition-colors"
                    >
                      {pay.orderId} <ArrowUpRight size={12} className="text-stone-300" />
                    </button>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-[10px]">
                        {pay.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 leading-none">{pay.customer}</p>
                        <p className="text-[10px] text-stone-400 mt-1">{pay.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border border-stone-200 px-2 py-0.5 rounded shadow-sm bg-white">
                      {pay.method}
                    </span>
                  </td>

                  <td className="p-5">
                    <span className="font-serif font-bold text-stone-900 flex items-center gap-0.5">
                      <IndianRupee size={12} />{pay.amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-stone-400 font-medium">{pay.paidAt}</p>
                  </td>

                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.style}`}>
                      {config.icon} {config.label}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center gap-2 group/id">
                      <span className="text-[11px] font-mono text-stone-400 truncate max-w-[100px]">
                        {pay.transactionId}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(pay.transactionId)}
                        className="p-1.5 text-stone-300 hover:text-stone-900 hover:bg-stone-100 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- PAYMENT DETAIL MODAL --- */}
      {isModalOpen && selectedPayment && (
        <PaymentDetailModal 
          payment={selectedPayment} 
          onClose={() => setIsModalOpen(false)} 
          config={getStatusConfig(selectedPayment.status)}
        />
      )}
    </div>
  );
};

/* --- MODAL COMPONENT --- */
const PaymentDetailModal = ({ payment, onClose, config }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-start bg-stone-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Hash size={14} className="text-stone-400" />
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Transaction Audit</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">{payment.id}</h2>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.style}`}>
                {config.icon} {config.label}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Section 1: Financial Summary */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-stone-900 rounded-2xl text-white">
                <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">Settled Amount</p>
                <p className="text-3xl font-serif font-bold flex items-center"><IndianRupee size={24}/> {payment.amount.toLocaleString('en-IN')}</p>
             </div>
             <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Gateway Reference</p>
                <p className="text-sm font-mono font-bold text-stone-800 truncate">{payment.transactionId}</p>
                <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1 italic"><Clock size={10}/> Timestamp: {payment.paidAt}</p>
             </div>
          </div>

          {/* Section 2: Order & Client Deep-Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest flex items-center gap-2">
                <User size={12}/> Customer Profile
              </h4>
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-3">
                 <div>
                    <p className="text-sm font-bold text-stone-900">{payment.customer}</p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1"><Mail size={12}/> {payment.email}</div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1"><Phone size={12}/> {payment.phone}</div>
                 </div>
                 <div className="pt-3 border-t border-stone-200">
                    <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">Billing Address</p>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{payment.address}</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-widest flex items-center gap-2">
                <Package size={12}/> Order Breakdown
              </h4>
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-stone-800">{payment.orderId}</span>
                    <button className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">View Order <ExternalLink size={10}/></button>
                 </div>
                 <div className="space-y-3">
                    {payment.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-stone-600">x{item.qty} {item.name}</span>
                        <span className="font-bold text-stone-800">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between">
                    <span className="text-xs font-bold text-stone-900 uppercase">Subtotal</span>
                    <span className="text-sm font-bold text-stone-900">₹{payment.amount}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-stone-200 text-[10px] font-bold uppercase text-stone-600 hover:bg-white transition-all">Download Receipt</button>
          <button className="px-5 py-2.5 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase hover:bg-stone-800 transition-all shadow-lg shadow-stone-200">Issue Refund</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;