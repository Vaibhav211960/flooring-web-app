import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Star, Mail, Trash2, MessageSquare,
  Calendar, User, Loader2, Search,
  SlidersHorizontal, CheckCircle2, XCircle,
} from "lucide-react";

// ── Shared axios instance ──
// FIX: was using "adminToken" — unified to "token"
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const ITEMS_PER_PAGE = 8;

const Feedbacks = () => {
  const [feedbacks,   setFeedbacks]   = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [ratingFilter, setRatingFilter] = useState(""); // "" | "1" | "2" | "3" | "4" | "5"
  const [statusFilter, setStatusFilter] = useState(""); // "" | "approved" | "pending" | "rejected"
  const [currentPage, setCurrentPage] = useState(1);

  // ── useCallback: stable fetch reference ──
  // FIX: was a plain async function — recreated every render
  // FIX: removed console.error — user now gets toast on failure
  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/feedback/admin/all");
      setFeedbacks(res.data.feedbacks || []);
    } catch {
      toast.error("Failed to load feedback.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  // ── useMemo: avgRating derived from feedbacks — no separate state needed ──
  // OLD: avgRating was a useState updated inside fetchFeedbacks
  // Problem: it was stale between renders and needed manual syncing
  // NEW: useMemo recomputes automatically whenever feedbacks changes
  const avgRating = useMemo(() => {
    if (!feedbacks.length) return "0.0";
    const avg = feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length;
    return avg.toFixed(1);
  }, [feedbacks]);

  // ── useMemo: stats derived from feedbacks ──
  const stats = useMemo(() => ({
    total:    feedbacks.length,
    fiveStar: feedbacks.filter((f) => f.rating === 5).length,
    pending:  feedbacks.filter((f) => !f.isApproved && !f.isRejected).length,
    approved: feedbacks.filter((f) => f.isApproved).length,
  }), [feedbacks]);

  // ── useMemo: filtered list — search + rating + status combined ──
  // OLD: no filtering at all — all reviews shown in one block
  // NEW: three filters combined in one memo pass
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (ratingFilter && fb.rating !== Number(ratingFilter)) return false;
      if (statusFilter === "approved" && !fb.isApproved)  return false;
      if (statusFilter === "rejected" && !fb.isRejected)  return false;
      if (statusFilter === "pending"  && (fb.isApproved || fb.isRejected)) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchUser    = fb.userId?.userName?.toLowerCase().includes(s);
        const matchEmail   = fb.userId?.email?.toLowerCase().includes(s);
        const matchProduct = fb.productId?.name?.toLowerCase().includes(s);
        const matchComment = fb.comment?.toLowerCase().includes(s);
        if (!matchUser && !matchEmail && !matchProduct && !matchComment) return false;
      }
      return true;
    });
  }, [feedbacks, ratingFilter, statusFilter, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, ratingFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE));

  const paginatedFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFeedbacks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFeedbacks, currentPage]);

  // ── Approve feedback ──
  // NEW: Module 8 requires approve/reject — was completely missing
  // Optimistic update — flips locally first, reverts if API fails
  const approveFeedback = useCallback(async (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => fb._id === id ? { ...fb, isApproved: true, isRejected: false } : fb)
    );
    try {
      await api.put(`/feedback/admin/approve/${id}`);
      toast.success("Review approved and published.");
    } catch {
      setFeedbacks((prev) =>
        prev.map((fb) => fb._id === id ? { ...fb, isApproved: false } : fb)
      );
      toast.error("Approval failed.");
    }
  }, []);

  // ── Reject feedback ──
  const rejectFeedback = useCallback(async (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => fb._id === id ? { ...fb, isRejected: true, isApproved: false } : fb)
    );
    try {
      await api.put(`/feedback/admin/reject/${id}`);
      toast.success("Review rejected and hidden.");
    } catch {
      setFeedbacks((prev) =>
        prev.map((fb) => fb._id === id ? { ...fb, isRejected: false } : fb)
      );
      toast.error("Rejection failed.");
    }
  }, []);

  // ── Delete with toast confirmation ──
  // FIX: was window.confirm() — replaced with toast confirmation pattern
  // FIX: delete failures were silent (console.error only) — now shows toast
  const deleteFeedback = useCallback((id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Delete this review permanently?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/feedback/admin/${id}`);
                  // Optimistic delete — no refetch
                  setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
                  toast.success("Review deleted.");
                } catch {
                  toast.error("Delete failed.");
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

  const clearFilters = () => {
    setSearchTerm("");
    setRatingFilter("");
    setStatusFilter("");
  };
  const hasActiveFilters = searchTerm || ratingFilter || statusFilter;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Reviews...</p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Customer Voice</h1>
          <p className="text-sm text-stone-500 mt-1 italic">
            Monitoring satisfaction and service quality benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 px-4 py-2.5 rounded-xl shadow-sm">
          <Star className="text-amber-500" size={16} fill="currentColor" />
          {/* FIX: avgRating was 0 on first render because it was set in a separate useState
              NEW: useMemo — always in sync with feedbacks, no stale state possible */}
          <span className="text-sm font-bold text-stone-900">{avgRating}</span>
          <span className="text-xs text-stone-400">avg rating</span>
        </div>
      </div>

      {/* Stats Cards */}
      {/* FIX: was md:grid-cols-3 with only 2 cards — broken layout */}
      {/* NEW: 4 cards, grid-cols-4 — Total, 5-Star, Pending, Approved */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Reviews</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">5 Star</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.fiveStar}</p>
        </div>
        <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 shadow-sm">
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Pending</p>
          <p className="text-2xl font-bold text-sky-700 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Approved</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.approved}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input
            type="text"
            placeholder="Search by user, product, or review text..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Rating filter */}
        <div className="relative">
          <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 transition-all shadow-sm appearance-none"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={13} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium outline-none focus:border-amber-500 transition-all shadow-sm appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700 border border-stone-200 bg-white rounded-xl hover:bg-stone-50 transition-all"
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {paginatedFeedbacks.length > 0 ? (
          paginatedFeedbacks.map((fb) => (
            <FeedbackCard
              key={fb._id}
              feedback={fb}
              onApprove={approveFeedback}
              onReject={rejectFeedback}
              onDelete={deleteFeedback}
            />
          ))
        ) : (
          <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
            <div className="bg-stone-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-stone-300" size={28} />
            </div>
            <h3 className="text-stone-900 font-bold">No Reviews Found</h3>
            <p className="text-sm text-stone-500 mt-1">
              {hasActiveFilters ? "Try adjusting your filters." : "Your inbox is currently empty."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredFeedbacks.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedbacks.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredFeedbacks.length}</span>
            {" "}reviews
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
    </div>
  );
};

// ── FeedbackCard as memoized component ──
// OLD: inline JSX in .map() — all cards re-rendered on any state change
// NEW: React.memo — only the changed card re-renders
const FeedbackCard = React.memo(({ feedback: fb, onApprove, onReject, onDelete }) => {

  // Status badge derived from fb fields — no extra state needed
  const statusBadge = fb.isApproved
    ? { label: "Approved", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" }
    : fb.isRejected
    ? { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-100" }
    : { label: "Pending",  cls: "bg-sky-50 text-sky-600 border-sky-100" };

  return (
    <div className={`bg-white border rounded-2xl transition-all duration-200 p-6 group ${
      fb.isRejected ? "border-rose-100 opacity-60" : "border-stone-200 hover:border-amber-200"
    }`}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">

        {/* User info */}
        <div className="flex gap-4">
          <div className="h-11 w-11 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200 shrink-0">
            <User size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 text-sm">
                {fb.userId?.userName || "Anonymous"}
              </h3>
              {/* Status badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-400 mt-1">
              <Mail size={11} />
              <span className="text-xs">{fb.userId?.email || "—"}</span>
            </div>
          </div>
        </div>

        {/* Stars + date */}
        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < fb.rating ? "text-amber-500" : "text-stone-200"}
                fill={i < fb.rating ? "currentColor" : "none"}
              />
            ))}
            <span className="text-xs font-bold text-stone-600 ml-1">{fb.rating}/5</span>
          </div>
          <div className="flex items-center gap-1 text-stone-400 mt-1.5">
            <Calendar size={11} />
            <span className="text-[10px] font-bold uppercase">
              {new Date(fb.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Product tag */}
      {fb.productId?.name && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mt-4 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          {fb.productId.name}
        </p>
      )}

      {/* Comment */}
      <div className="mt-4 bg-stone-50 rounded-xl p-4 relative">
        <MessageSquare size={14} className="text-stone-200 absolute top-3 right-3" />
        <p className="text-sm text-stone-600 leading-relaxed italic">"{fb.comment}"</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-100">

        {/* Approve — only show if not already approved */}
        {!fb.isApproved && (
          <button
            onClick={() => onApprove(fb._id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
          >
            <CheckCircle2 size={13} /> Approve
          </button>
        )}

        {/* Reject — only show if not already rejected */}
        {!fb.isRejected && (
          <button
            onClick={() => onReject(fb._id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-[10px] font-bold uppercase hover:bg-stone-200 transition-all border border-stone-200"
          >
            <XCircle size={13} /> Reject
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(fb._id)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all border border-red-100"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
});
FeedbackCard.displayName = "FeedbackCard";

export default Feedbacks;