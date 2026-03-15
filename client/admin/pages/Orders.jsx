import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Eye, X, Package, Calendar, Phone,
  Printer, Loader2, Search, SlidersHorizontal,
  Trash2, FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── Shared axios instance — same pattern as all other files ──
// FIX: was using plain axios with repeated headers everywhere
// NEW: one instance, token injected automatically via interceptor
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ITEMS_PER_PAGE = 10;

// ── Status config — single source of truth ──
// OLD: getStatusColor function was a switch/case repeated in multiple places
// NEW: one object, looked up by key — change a color once, updates everywhere
const STATUS_CONFIG = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-100"   },
  arriving:  { label: "Arriving",  cls: "bg-blue-50 text-blue-700 border-blue-100"      },
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-700 border-rose-100"      },
};
const getStatusCfg = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] || { label: status, cls: "bg-stone-50 text-stone-700 border-stone-100" };

const Orders = () => {
  const [orders,       setOrders]       = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen,  setIsDetailOpen]  = useState(false);

  // ── Filters ──
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterDate,    setFilterDate]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);

  // ── useCallback: stable fetch reference ──
  // FIX: was a plain async function — recreated on every render
  // FIX: auth header was commented out — orders API was unprotected
  // FIX: removed console.log left in production code
  const fetchAllOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/orders/admin/getAll");
      setOrders(res.data.orders);
    } catch {
      toast.error("Could not retrieve order registry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllOrders(); }, [fetchAllOrders]);

  // ── useMemo: filtered + searched + status filtered list ──
  // OLD: only had date filter — no search, no status filter
  // NEW: all three filters combined in one memo, only recomputes when any filter changes
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Date filter
      if (filterDate) {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        if (orderDate !== filterDate) return false;
      }
      // Status filter
      if (filterStatus && order.orderStatus?.toLowerCase() !== filterStatus) return false;
      // Search filter — order ID, customer name, phone
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchesId   = order._id?.toLowerCase().includes(s);
        const matchesName = order.shippingAddress?.fullName?.toLowerCase().includes(s);
        const matchesPhone= order.shippingAddress?.contact?.toLowerCase().includes(s);
        if (!matchesId && !matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }, [orders, filterDate, filterStatus, searchTerm]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterDate, filterStatus]);

  // ── Summary stats — only recomputes when filteredOrders changes ──
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((acc, o) => acc + (o.netBill || 0), 0),
    [filteredOrders]
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const openDetail  = useCallback((order) => { setSelectedOrder(order); setIsDetailOpen(true); }, []);
  const closeDetail = useCallback(() => { setIsDetailOpen(false); setSelectedOrder(null); }, []);

  // ── Optimistic status update — patches local state, no refetch ──
  // OLD: onRefresh called fetchAllOrders() after every status update = full server round trip
  // NEW: update just that one order in local state directly
  const handleStatusUpdate = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
    );
    // Also update selectedOrder so the modal reflects the change immediately
    setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : prev);
  }, []);

  // ── Optimistic delete — removes from local state, no refetch ──
  const handleDeleteOrder = useCallback((orderId) => {
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
    closeDetail();
  }, [closeDetail]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setFilterStatus("");
  };
  const hasActiveFilters = searchTerm || filterDate || filterStatus;

  if (isLoading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-amber-600" size={36} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Registry...</p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Order Registry</h1>
          <p className="text-sm text-stone-500 mt-1 italic">
            Tracking customer acquisitions and material fulfillment.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-stone-200 shadow-sm shrink-0">
          <div className="text-center px-3">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Volume</p>
            <p className="text-lg font-bold text-stone-900">{filteredOrders.length}</p>
          </div>
          <div className="w-px h-8 bg-stone-100" />
          <div className="text-center px-3">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Revenue</p>
            <p className="text-lg font-bold text-amber-600">
              ₹{totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      {/* OLD: only had a date input — no search, no status filter */}
      {/* NEW: all three filters in one clean bar */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input
            type="text"
            placeholder="Search by name, order ID, or phone..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Date filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pl-9 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 transition-all shadow-sm"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 transition-all shadow-sm appearance-none"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Clear filters — only visible when a filter is active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700 border border-stone-200 bg-white rounded-xl hover:bg-stone-50 transition-all"
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Order ID</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Customer</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Date</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Net Bill</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onView={openDetail}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-20 text-center text-stone-400 italic text-sm">
                  No orders found{hasActiveFilters ? " for the current filters." : "."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredOrders.length}</span>
            {" "}orders
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >← Prev</button>
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
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all border ${
                      currentPage === item
                        ? "bg-stone-900 text-amber-400 border-stone-900 shadow-md"
                        : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                    }`}
                  >{item}</button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >Next →</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={closeDetail}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDeleteOrder}
        />
      )}
    </div>
  );
};

// ── OrderRow as memoized component ──
// OLD: inline JSX in .map() — all rows re-rendered on any state change
// NEW: React.memo — only re-renders when this specific order changes
const OrderRow = React.memo(({ order, onView }) => {
  const cfg = getStatusCfg(order.orderStatus);
  return (
    <tr className="hover:bg-stone-50/50 transition-colors group">
      <td className="p-5 font-mono text-[10px] font-bold text-stone-400">
        #{order._id.slice(-8).toUpperCase()}
      </td>
      <td className="p-5">
        <span className="text-sm font-bold text-stone-900 block">
          {order.shippingAddress?.fullName || "Guest"}
        </span>
        <span className="text-[10px] text-stone-400 font-mono">
          {order.paymentMode}
        </span>
      </td>
      <td className="p-5 text-xs font-medium text-stone-600">
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })}
      </td>
      <td className="p-5 text-sm font-bold text-amber-700">
        ₹{order.netBill?.toLocaleString("en-IN")}
      </td>
      <td className="p-5">
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.cls}`}>
          {cfg.label}
        </span>
      </td>
      <td className="p-5 text-right">
        <button
          onClick={() => onView(order)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-[9px] font-bold uppercase hover:bg-amber-600 transition-all shadow-md active:scale-95"
        >
          <Eye size={12} /> Inspect
        </button>
      </td>
    </tr>
  );
});
OrderRow.displayName = "OrderRow";

// ── Order Detail Modal ────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusUpdate, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus,  setNewStatus]  = useState(order.orderStatus);
  // NEW: internal notes field — Module 5 requirement
  const [note,       setNote]       = useState(order.adminNote || "");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      await api.put(`/orders/admin/update-status/${order._id}`, { status: newStatus });
      // ── Optimistic update: patch parent state directly ──
      // OLD: called onRefresh() = full list refetch after every status change
      // NEW: call onStatusUpdate() which patches just this order in parent state
      onStatusUpdate(order._id, newStatus);
      toast.success(`Order marked as ${newStatus}.`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Save internal note ──
  const handleSaveNote = async () => {
    try {
      setIsSavingNote(true);
      await api.put(`/orders/admin/update-status/${order._id}`, { adminNote: note });
      toast.success("Note saved.");
    } catch {
      toast.error("Failed to save note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // ── Delete with toast confirmation — replaces window.confirm() ──
  // OLD: window.confirm() — ugly browser dialog, breaks your design
  // NEW: same toast confirmation pattern used in Products/Categories/etc.
  const handleDeleteOrder = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">
            Permanently delete order <strong>#{order._id.slice(-8).toUpperCase()}</strong>?
          </p>
          <p className="text-xs text-stone-500">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/orders/admin/delete/${order._id}`);
                  // Optimistic delete — removes from parent state, no refetch
                  onDelete(order._id);
                  toast.success("Order removed from registry.");
                } catch {
                  toast.error("Delete failed. Authorization required.");
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
            >Confirm Delete</button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
            >Cancel</button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const statusCfg = getStatusCfg(order.orderStatus);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">

        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-900 rounded-2xl text-amber-500 shadow-lg">
              <Package size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Material Manifest</p>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                #{order._id.slice(-8).toUpperCase()}
              </h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Column 1: Client + Status + Notes */}
            <div className="space-y-8">

              {/* Client profile */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Client Profile</h3>
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-stone-900 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                      {order.shippingAddress?.fullName?.charAt(0) || "?"}
                    </div>
                    <p className="text-sm font-bold text-stone-900 uppercase leading-tight">
                      {order.shippingAddress?.fullName || "Guest"}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/50 space-y-2">
                    <div className="flex items-center gap-3 text-stone-600">
                      <Phone size={13} className="text-amber-600 shrink-0" />
                      <span className="text-xs font-medium">{order.shippingAddress?.contact || "—"}</span>
                    </div>
                    {order.shippingAddress?.address && (
                      <div className="flex items-start gap-3 text-stone-600">
                        <span className="text-[10px] font-medium text-stone-400 mt-0.5">Address</span>
                        <span className="text-xs">{order.shippingAddress.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Status management */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Status Management</h3>
                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Update Status</p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-amber-500 transition-all"
                  >
                    {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || newStatus === order.orderStatus}
                    className="w-full py-2.5 bg-stone-900 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : null}
                    {isUpdating ? "Updating..." : "Apply Status"}
                  </button>
                </div>
              </section>

              {/* ── Internal Notes — NEW feature from Module 5 checklist ── */}
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">
                  <FileText size={10} className="inline mr-1" />
                  Internal Note
                </h3>
                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Add a private note about this order..."
                    className="w-full text-xs text-stone-700 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 resize-none transition-all"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={isSavingNote || note === (order.adminNote || "")}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSavingNote ? <Loader2 size={12} className="animate-spin" /> : null}
                    {isSavingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </section>
            </div>

            {/* Column 2 & 3: Items + Bill */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-4">Architectural Selection</h3>
                <div className="border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-stone-50 text-[9px] uppercase font-bold text-stone-400 tracking-widest">
                      <tr>
                        <th className="p-4 text-left">Product</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {order.items?.map((item, i) => (
                        <tr key={i} className="text-xs">
                          <td className="p-4">
                            <p className="font-bold text-stone-800 uppercase">{item.productName}</p>
                            {item.sku && (
                              <p className="text-[9px] text-stone-400 font-mono mt-0.5">{item.sku}</p>
                            )}
                          </td>
                          <td className="p-4 text-center font-bold text-stone-600">
                            {item.units || item.quantity}
                          </td>
                          <td className="p-4 text-right font-bold text-stone-900">
                            ₹{item.totalAmount?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Net bill card */}
              <div className="p-6 bg-stone-900 rounded-2xl text-white flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-[9px] font-bold text-amber-500 uppercase mb-1 tracking-widest">Net Settlement</p>
                  <p className="text-2xl font-serif font-black">
                    ₹{order.netBill?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1">{order.paymentMode}</p>
                </div>
                {/* Print button — scoped to modal area only */}
                <button
                  onClick={() => window.print()}
                  className="p-2.5 hover:bg-stone-800 rounded-xl transition-colors"
                  title="Print order"
                >
                  <Printer className="text-stone-400" size={18} />
                </button>
              </div>

              {/* Order metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Order Date</p>
                  <p className="text-sm font-bold text-stone-800">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Payment Mode</p>
                  <p className="text-sm font-bold text-stone-800 uppercase">{order.paymentMode || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex justify-between items-center shrink-0">
          <button
            onClick={handleDeleteOrder}
            className="flex items-center gap-2 text-[10px] font-bold uppercase text-rose-400 hover:text-rose-600 tracking-widest transition-colors"
          >
            <Trash2 size={13} /> Delete Record
          </button>
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

export default Orders;