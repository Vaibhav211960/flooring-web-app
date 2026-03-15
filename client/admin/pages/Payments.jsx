import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  IndianRupee, ArrowUpRight, CheckCircle2, Clock,
  AlertCircle, X, Download, Loader2, Search,
} from "lucide-react";

// ── Shared axios instance ──
// FIX: was using "adminToken" — unified to "token"
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ITEMS_PER_PAGE = 10;

// ── Status config at module level — pure function, no need to pass as prop ──
// OLD: defined inside component AND passed as prop to modal — redundant
// NEW: defined once here, used everywhere directly
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
      return { style: "bg-stone-100 text-stone-500 border-stone-200", icon: null, label: status || "—" };
  }
};

const Payments = () => {
  const [payments,        setPayments]        = useState([]);
  const [isLoading,       setIsLoading]       = useState(true); // FIX: was "loading"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [currentPage,     setCurrentPage]     = useState(1);

  // ── useCallback: stable fetch reference ──
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/payments/admin/getAll");
      // FIX: was response.data — if backend returns { payments: [...] } this would
      // set the whole object not the array. Now handles both shapes safely.
      setPayments(res.data.payments || res.data || []);
    } catch {
      toast.error("Failed to load payment data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // ── useMemo: totalRevenue ──
  // OLD: computed directly in render body — ran on every render
  const totalRevenue = useMemo(() =>
    payments
      .filter((p) => ["confirmed", "success"].includes(p.paymentStatus?.toLowerCase()))
      .reduce((acc, p) => acc + (p.amount || 0), 0),
  [payments]);

  // ── useMemo: search filter ──
  const filteredPayments = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return payments;
    return payments.filter((p) => {
      const name  = (p.orderId?.userId?.name || p.orderId?.shippingAddress?.fullName || "").toLowerCase();
      const email = (p.orderId?.userId?.email || "").toLowerCase();
      const id    = p._id.slice(-6).toLowerCase();
      return name.includes(s) || email.includes(s) || id.includes(s);
    });
  }, [payments, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE));

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  const openModal  = useCallback((pay) => { setSelectedPayment(pay); setIsModalOpen(true); }, []);
  const closeModal = useCallback(() => { setIsModalOpen(false); setSelectedPayment(null); }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Payments...</p>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Confirmed Revenue</p>
          <p className="text-sm font-bold text-stone-900 flex items-center gap-0.5">
            <IndianRupee size={12} /> {totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
        <input
          type="text"
          placeholder="Search by name, email or transaction ID..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            {paginatedPayments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-16 text-center text-stone-400 italic text-sm">
                  {searchTerm ? "No payments match your search." : "No payment records found."}
                </td>
              </tr>
            ) : (
              paginatedPayments.map((pay) => {
                const config      = getStatusConfig(pay.paymentStatus);
                const displayName = pay.orderId?.userId?.name || pay.orderId?.shippingAddress?.fullName || "Guest";
                const userEmail   = pay.orderId?.userId?.email || "—";
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
                      <p className="text-sm font-bold text-stone-900">₹{pay.amount?.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(pay.paymentDate || pay.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${config.style}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => openModal(pay)} className="p-2 hover:bg-stone-100 rounded-lg transition-all" title="View details">
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

      {/* Pagination */}
      {filteredPayments.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)}
            </span>
            {" "}of <span className="text-stone-700 font-bold">{filteredPayments.length}</span> payments
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) acc.push("gap-" + page);
                acc.push(page);
                return acc;
              }, [])
              .map((item) =>
                typeof item === "string" ? (
                  <span key={item} className="px-1.5 text-stone-300 text-xs">…</span>
                ) : (
                  <button key={item} onClick={() => setCurrentPage(item)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all border ${
                      currentPage === item ? "bg-stone-900 text-amber-400 border-stone-900 shadow-md" : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                    }`}>{item}</button>
                )
              )}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next →
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedPayment && (
        <PaymentDetailModal payment={selectedPayment} onClose={closeModal} />
      )}
    </div>
  );
};

// ── Payment Detail Modal ──────────────────────────────────────────────────────
const PaymentDetailModal = ({ payment, onClose }) => {
  // FIX: getStatusConfig no longer passed as prop — available from module scope directly
  const config      = getStatusConfig(payment.paymentStatus);
  const displayName = payment.orderId?.userId?.name || payment.orderId?.shippingAddress?.fullName || "Guest";

  // ── Receipt generation via dynamic import ──
  // FIX: was static import at top — if jsPDF not installed, entire file crashes on load
  // NEW: dynamic import inside the function — only tries to load when admin clicks Receipt
  // If not installed, shows a helpful install message instead of crashing
  const generateReceipt = async () => {
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();
      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("FLOORING STORE", 14, 22);
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
        head:   [["Description", "Amount"]],
        body:   [["Order Payment", `INR ${payment.amount?.toLocaleString("en-IN")}`]],
        theme:  "grid",
        headStyles: { fillColor: [28, 25, 23] },
      });
      doc.save(`Receipt_PAY-${payment._id.slice(-6)}.pdf`);
      toast.success("Receipt downloaded.");
    } catch {
      toast.error("Run: npm install jspdf jspdf-autotable — then try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">

        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Payment Details</p>
            <h2 className="text-base font-bold text-stone-900 font-mono mt-0.5">
              PAY-{payment._id.slice(-6).toUpperCase()}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-500 font-bold text-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">{displayName}</p>
              <p className="text-[10px] text-stone-400">{payment.orderId?.userId?.email || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Method</p>
              <p className="text-sm font-medium text-stone-700">{payment.paymentMode}</p>
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
                {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Order</p>
              <p className="text-xs font-mono text-stone-500">
                #{payment.orderId?._id?.slice(-8).toUpperCase() || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-stone-900 p-5 rounded-xl text-white">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-serif font-bold">₹{payment.amount?.toLocaleString("en-IN")}</p>
            </div>
            <button
              onClick={generateReceipt}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              <Download size={14} /> Receipt
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payments;