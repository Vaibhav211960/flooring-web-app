import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  IndianRupee, ArrowUpRight, CheckCircle2, Clock, AlertCircle,
  X, Download, Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        "http://localhost:5000/api/payments/admin/getAll",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(response.data);
    } catch (error) {
      toast.error("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "success":
        return { style: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: <CheckCircle2 size={12} />, label: "Confirmed" };
      case "pending":
      case "processing":
        return { style: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock size={12} />, label: "Processing" };
      case "cancelled":
      case "failed":
        return { style: "bg-rose-50 text-rose-700 border-rose-100", icon: <AlertCircle size={12} />, label: "Failed" };
      default:
        return { style: "bg-stone-100 text-stone-500 border-stone-200", icon: null, label: status };
    }
  };

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "confirmed" || p.paymentStatus === "success")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (loading)
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Payments</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Track all transactions and payment statuses.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Confirmed Revenue
          </p>
          <p className="text-sm font-bold text-stone-900 flex items-center gap-0.5">
            <IndianRupee size={12} /> {totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Transaction</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Customer</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Method</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Amount</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-16 text-center text-stone-400 italic text-sm">
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((pay) => {
                const config = getStatusConfig(pay.paymentStatus);
                const displayName =
                  pay.orderId?.userId?.name ||
                  pay.orderId?.shippingAddress?.fullName ||
                  "Guest";
                const userEmail = pay.orderId?.userId?.email || "—";

                return (
                  <tr key={pay._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-5 font-mono text-[11px] font-bold text-stone-400">
                      PAY-{pay._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-stone-900 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900 leading-none">{displayName}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
                        {pay.paymentMode}
                      </span>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-bold text-stone-900">
                        ₹{pay.amount?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(pay.paymentDate || pay.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short",
                        })}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.style}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => { setSelectedPayment(pay); setIsModalOpen(true); }}
                        className="p-2 hover:bg-stone-100 rounded-lg transition-all"
                        title="View details"
                      >
                        <ArrowUpRight size={16} className="text-stone-400 hover:text-stone-700" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setIsModalOpen(false)}
          getStatusConfig={getStatusConfig}
        />
      )}
    </div>
  );
};

// --- Payment Detail Modal ---
const PaymentDetailModal = ({ payment, onClose, getStatusConfig }) => {
  const config = getStatusConfig(payment.paymentStatus);
  const displayName =
    payment.orderId?.userId?.name ||
    payment.orderId?.shippingAddress?.fullName ||
    "Guest";

  const generateReceipt = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("INSCAPE LAYERS", 14, 22);
      doc.setFontSize(8);
      doc.text("OFFICIAL TRANSACTION RECEIPT", 14, 30);

      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text(`Transaction ID: PAY-${payment._id.slice(-6).toUpperCase()}`, 14, 55);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN")}`, 14, 62);
      doc.text(`Customer: ${displayName}`, 14, 69);
      doc.text(`Payment Mode: ${payment.paymentMode}`, 14, 76);

      autoTable(doc, {
        startY: 86,
        head: [["Description", "Amount"]],
        body: [["Order Payment", `INR ${payment.amount?.toLocaleString("en-IN")}`]],
        theme: "grid",
        headStyles: { fillColor: [28, 25, 23] },
      });

      doc.save(`Inscape_Receipt_${payment._id.slice(-6)}.pdf`);
      toast.success("Receipt downloaded.");
    } catch {
      toast.error("Could not generate receipt.");
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Payment Details</p>
            <h2 className="text-base font-bold text-stone-900 font-mono mt-0.5">
              PAY-{payment._id.slice(-6).toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-400 hover:text-stone-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">{displayName}</p>
              <p className="text-[10px] text-stone-400">
                {payment.orderId?.userId?.email || "—"}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Method</p>
              <p className="text-sm font-bold text-stone-900">{payment.paymentMode}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${config.style}`}>
                {config.icon} {config.label}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Date</p>
              <p className="text-sm text-stone-700">
                {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Order</p>
              <p className="text-xs font-mono text-stone-500">
                #{payment.orderId?._id?.slice(-8).toUpperCase() || "—"}
              </p>
            </div>
          </div>

          {/* Amount + Download */}
          <div className="flex items-center justify-between bg-stone-900 p-5 rounded-xl text-white">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-serif font-bold">
                ₹{payment.amount?.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              onClick={generateReceipt}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              <Download size={14} /> Receipt
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;