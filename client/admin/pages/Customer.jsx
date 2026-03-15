import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Users, Trash2, Mail, Phone, Search,
  Loader2, ShieldOff, ShieldCheck, Eye, X,
  Package, Calendar, ChevronRight,
} from "lucide-react";

// ── Shared axios instance ──
// FIX: was using "adminToken" — unified to "token" to match all other files
// FIX: token was read once at component level — if it expired mid-session all calls failed
// NEW: interceptor reads token fresh on every request
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  const [users,        setUsers]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);  // FIX: was "loading" — unified to "isLoading"
  const [searchTerm,   setSearchTerm]   = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);

  // For order history modal
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [isHistoryOpen,   setIsHistoryOpen]   = useState(false);

  // ── useCallback: stable fetch reference ──
  // FIX: was a plain async function — recreated every render
  // FIX: removed console.error left in production code
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users/getAllUsers");
      // FIX: sort newest first — MongoDB returns oldest first by default
      // Without this, the newest registered customer was always buried at the bottom
      // and could fall off the last page or be easy to miss
      const sorted = [...(res.data.users || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUsers(sorted);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── useMemo: filter only recomputes when users or searchTerm changes ──
  // OLD: plain .filter() in render body — ran on every single render
  // NEW: useMemo caches result — only recomputes when inputs actually change
  // FIX: now also searches lname and contact, not just fname and email
  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      u.fname?.toLowerCase().includes(s) ||
      u.lname?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.contact?.toLowerCase().includes(s)
    );
  }, [users, searchTerm]);

  // Reset to page 1 on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // ── Block / Unblock toggle ──
  // FIX: backend blockUser controller toggles automatically (no body needed)
  // It ignores any isBlocked field we send — it just flips whatever the current value is
  // So we optimistically flip locally, then confirm with the actual value from the response
  const toggleBlock = useCallback(async (user) => {
    // Optimistic flip
    setUsers((prev) =>
      prev.map((u) => u._id === user._id ? { ...u, isBlocked: !user.isBlocked } : u)
    );
    try {
      const res = await api.put(`/users/block/${user._id}`);
      // Confirm with actual value from server response — source of truth
      const actualBlocked = res.data.user.isBlocked;
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isBlocked: actualBlocked } : u)
      );
      toast.success(`${user.fname} ${actualBlocked ? "blocked" : "unblocked"}.`);
    } catch {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isBlocked: user.isBlocked } : u)
      );
      toast.error("Status update failed.");
    }
  }, []);

  // ── Delete user with toast confirmation ──
  // FIX: was calling axios.put() to delete — should be DELETE method
  // FIX: token was read from component-level variable — now handled by interceptor
  const deleteUser = useCallback((userId, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">
            Permanently remove <strong>{name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setProcessingId(userId);
                try {
                  // FIX: was axios.put() — corrected to DELETE
                  await api.delete(`/users/${userId}`);
                  // Optimistic delete — no refetch needed
                  setUsers((prev) => prev.filter((u) => u._id !== userId));
                  toast.success("User removed.");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Delete failed.");
                } finally {
                  setProcessingId(null);
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
            >Confirm</button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
            >Cancel</button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  }, []);

  const openHistory  = useCallback((user) => { setSelectedUser(user); setIsHistoryOpen(true); }, []);
  const closeHistory = useCallback(() => { setIsHistoryOpen(false); setSelectedUser(null); }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Customers...</p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Customers</h1>
          {/* FIX: shows filteredUsers.length when searching so count reflects visible results */}
          <p className="text-stone-500 text-sm mt-1 font-medium italic">
            {searchTerm
              ? `${filteredUsers.length} of ${users.length} customers`
              : `${users.length} registered ${users.length === 1 ? "customer" : "customers"}`}
          </p>
        </div>

        {/* Search — FIX: now searches fname, lname, email AND contact */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl w-full md:w-80 text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Customer</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Contact</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Role</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Joined</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <CustomerRow
                  key={user._id}
                  user={user}
                  processingId={processingId}
                  onToggleBlock={toggleBlock}
                  onDelete={deleteUser}
                  onViewHistory={openHistory}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-stone-200 mb-3" />
                  <p className="italic text-stone-400 text-sm">
                    {searchTerm ? "No customers match your search." : "No customers registered yet."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredUsers.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredUsers.length}</span>
            {" "}customers
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

      {/* Order History Modal */}
      {isHistoryOpen && selectedUser && (
        <CustomerHistoryModal
          user={selectedUser}
          onClose={closeHistory}
        />
      )}
    </div>
  );
};

// ── CustomerRow as memoized component ──
// OLD: inline JSX in .map() — all rows re-rendered on any state change
// NEW: React.memo — only the changed row re-renders
const CustomerRow = React.memo(({ user, processingId, onToggleBlock, onDelete, onViewHistory }) => {
  const initials = `${user.fname?.[0] || ""}${user.lname?.[0] || ""}`.toUpperCase();

  return (
    <tr className={`transition-colors group ${user.isBlocked ? "bg-rose-50/30" : "hover:bg-stone-50/50"}`}>

      {/* Customer */}
      <td className="p-5">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold border text-xs shrink-0 ${
            user.isBlocked
              ? "bg-rose-100 text-rose-400 border-rose-200"
              : "bg-stone-100 text-stone-600 border-stone-200"
          }`}>
            {initials || "?"}
          </div>
          <div>
            <p className="font-bold text-stone-900 text-sm">
              {user.fname} {user.lname}
            </p>
            <p className="text-[10px] text-stone-400 font-mono">
              #{user._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* Contact */}
      <td className="p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Mail size={11} className="text-stone-400 shrink-0" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Phone size={11} className="text-stone-400 shrink-0" />
            {user.contact || "—"}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-700">
          {user.role || "customer"}
        </span>
      </td>

      {/* Joined */}
      <td className="p-5 text-xs text-stone-500">
        {new Date(user.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })}
      </td>

      {/* Block status badge */}
      <td className="p-5">
        {user.isBlocked ? (
          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-rose-50 text-rose-600 border-rose-100">
            Blocked
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
            Active
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="p-5">
        <div className="flex items-center justify-end gap-1">

          {/* View order history */}
          <button
            onClick={() => onViewHistory(user)}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
            title="View order history"
          >
            <Eye size={15} />
          </button>

          {/* Block / Unblock toggle */}
          <button
            onClick={() => onToggleBlock(user)}
            className={`p-2 rounded-lg transition-all ${
              user.isBlocked
                ? "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
                : "text-stone-400 hover:text-rose-500 hover:bg-rose-50"
            }`}
            title={user.isBlocked ? "Unblock user" : "Block user"}
          >
            {user.isBlocked ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(user._id, `${user.fname} ${user.lname}`)}
            disabled={processingId === user._id}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
            title="Delete customer"
          >
            {processingId === user._id
              ? <Loader2 size={15} className="animate-spin" />
              : <Trash2 size={15} />}
          </button>
        </div>
      </td>
    </tr>
  );
});
CustomerRow.displayName = "CustomerRow";

// ── Customer Order History Modal ──────────────────────────────────────────────
// NEW: Module 6 requires viewing a customer's order history
// Fetches orders for this specific user when the modal opens
const CustomerHistoryModal = ({ user, onClose }) => {
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/orders/admin/user/${user._id}`);
        setOrders(res.data.orders || []);
      } catch {
        toast.error("Could not load order history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserOrders();
  }, [user._id]);

  // Total spend across all orders
  const totalSpend = useMemo(
    () => orders.reduce((acc, o) => acc + (o.netBill || 0), 0),
    [orders]
  );

  const STATUS_CLS = {
    pending:   "bg-amber-50 text-amber-700 border-amber-100",
    arriving:  "bg-blue-50 text-blue-700 border-blue-100",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">

        {/* Header */}
        <div className="px-7 py-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm uppercase">
              {user.fname?.[0]}{user.lname?.[0]}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {user.fname} {user.lname}
              </h2>
              <p className="text-[10px] text-stone-400 font-mono">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Summary strip */}
        {!isLoading && orders.length > 0 && (
          <div className="flex items-center gap-6 px-7 py-3 bg-white border-b border-stone-100 shrink-0">
            <div>
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Orders</p>
              <p className="text-lg font-bold text-stone-900">{orders.length}</p>
            </div>
            <div className="w-px h-8 bg-stone-100" />
            <div>
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Spend</p>
              <p className="text-lg font-bold text-amber-600">₹{totalSpend.toLocaleString("en-IN")}</p>
            </div>
          </div>
        )}

        {/* Order list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="animate-spin text-amber-600" size={28} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Package size={32} className="text-stone-200" />
              <p className="text-sm italic text-stone-400">No orders placed yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between px-7 py-4 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <Package size={15} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={10} className="text-stone-400" />
                        <p className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                      STATUS_CLS[order.orderStatus?.toLowerCase()] || "bg-stone-50 text-stone-500 border-stone-100"
                    }`}>
                      {order.orderStatus}
                    </span>
                    <p className="text-sm font-bold text-stone-900 min-w-[80px] text-right">
                      ₹{order.netBill?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-stone-100 bg-stone-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;