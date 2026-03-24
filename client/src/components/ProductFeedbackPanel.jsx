// ─────────────────────────────────────────────────────────────────────────────
// components/ProductFeedbackPanel.jsx
//
// WHY THIS EXISTS:
// ProductDetails.jsx and OrderDetails.jsx both had IDENTICAL review logic:
//   - Fetch reviews + eligibility check
//   - Submit new review
//   - Edit own review
//   - Delete own review with toast confirmation
//   - Star rating UI
//
// That's ~200 lines duplicated in two files.
// Bug fix? Make it twice. Style change? Make it twice. Never again.
//
// HOW TO USE:
//   import ProductFeedbackPanel from "../components/ProductFeedbackPanel";
//   <ProductFeedbackPanel productId={id} orderDelivered={true} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Star, Send, Lock, Loader2, MessageSquare,
  CheckCircle2, Pencil, Trash2, X, Check,
} from "lucide-react";
import api from "../utils/api";
import { getLoggedInUserId } from "../utils/auth";

const ProductFeedbackPanel = ({ productId, productName, orderDelivered = false }) => {
  const loggedInUserId = useMemo(() => getLoggedInUserId(), []);
  const isLoggedIn     = !!loggedInUserId;

  const [reviews,        setReviews]        = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [isEligible,     setIsEligible]     = useState(false);

  // Submit state
  const [reviewText,     setReviewText]     = useState("");
  const [rating,         setRating]         = useState(5);
  const [isSubmitting,   setIsSubmitting]   = useState(false);

  // Edit state
  const [editingId,      setEditingId]      = useState(null);
  const [editText,       setEditText]       = useState("");
  const [editRating,     setEditRating]     = useState(5);
  const [isSaving,       setIsSaving]       = useState(false);

  // Show all toggle
  const [showAll,        setShowAll]        = useState(false);

  // ── Fetch reviews + eligibility ──
  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const reviewRes = await api.get(`/feedback/product/${productId}`);
        setReviews(reviewRes.data.feedbacks || []);

        // Only check eligibility if logged in AND order is delivered
        if (isLoggedIn && orderDelivered) {
          const eligRes = await api.get(
            `/feedback/verify/verify-eligibility/${productId}`
          );
          setIsEligible(eligRes.data.eligible);
        }
      } catch {
        // Silent fail — reviews are non-critical
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [productId, isLoggedIn, orderDelivered]);

  // ── Submit review ──
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await api.post("/feedback/submit", {
        productId, comment: reviewText, rating,
      });
      setReviews((prev) => [res.data.feedback, ...prev]);
      setReviewText("");
      setRating(5);
      setIsEligible(false);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review.");
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewText, rating, productId]);

  // ── Edit handlers ──
  const handleEditStart  = useCallback((rev) => {
    setEditingId(rev._id);
    setEditText(rev.comment);
    setEditRating(rev.rating);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  }, []);

  const handleEditSave = useCallback(async (reviewId) => {
    if (!editText.trim()) return;
    try {
      setIsSaving(true);
      const res = await api.put(`/feedback/${reviewId}`, {
        comment: editText, rating: editRating,
      });
      setReviews((prev) =>
        prev.map((r) => r._id === reviewId ? res.data.feedback : r)
      );
      setEditingId(null);
      toast.success("Review updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review.");
    } finally {
      setIsSaving(false);
    }
  }, [editText, editRating]);

  // ── Delete with toast confirmation ──
  // FIX: was window.confirm() in some versions — now consistent toast pattern
  const handleDelete = useCallback((reviewId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Delete your review?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/feedback/${reviewId}`);
                  setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                  setIsEligible(true);
                  toast.success("Review deleted.");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Could not delete review.");
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

  // ── Derived values ──
  const avgRating      = useMemo(() =>
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null,
    [reviews]
  );

  const visibleReviews = useMemo(() =>
    showAll ? reviews : reviews.slice(0, 2),
    [reviews, showAll]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-700" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
            {productName ? `Reviews for ${productName}` : "Reviews"}
          </p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5">
            <Star size={11} fill="#f59e0b" className="text-amber-500" />
            <span className="text-xs font-bold text-stone-800">{avgRating}</span>
            <span className="text-[9px] text-stone-400 font-medium">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}
      </div>

      {/* Submit form — only if eligible */}
      {isLoggedIn && orderDelivered && isEligible && (
        <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              You can review this product
            </span>
          </div>
          {/* Star selector */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={20}
                  fill={star <= rating ? "#b45309" : "none"}
                  className={star <= rating ? "text-amber-700" : "text-stone-300"}
                />
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts on quality and finish..."
              className="w-full bg-white border border-stone-200 p-4 pr-14 rounded-xl text-sm focus:border-amber-500 outline-none h-24 resize-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute bottom-3 right-3 bg-stone-900 text-amber-500 p-2.5 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      )}

      {/* Locked messages */}
      {isLoggedIn && orderDelivered && !isEligible && reviews.length === 0 && !isLoading && (
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <p className="text-xs text-stone-500 italic">
            No reviews yet. You have already reviewed this product.
          </p>
        </div>
      )}

      {!orderDelivered && isLoggedIn && (
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <p className="text-xs text-stone-500 italic">
            You can leave a review once this order is delivered.
          </p>
        </div>
      )}

      {!isLoggedIn && (
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <p className="text-xs text-stone-500 italic">
            Sign in to read and leave reviews.
          </p>
        </div>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-4 text-stone-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs italic text-stone-400 py-2">No reviews yet for this product.</p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((rev) => {
            const isOwner  = loggedInUserId && rev.userId?._id === loggedInUserId;
            const isEditing = editingId === rev._id;

            return (
              <div
                key={rev._id}
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all ${
                  isEditing ? "border-amber-300" : "border-stone-100 hover:border-stone-200"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Pencil size={11} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Editing your review</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button type="button" key={star} onClick={() => setEditRating(star)}>
                          <Star
                            size={17}
                            fill={star <= editRating ? "#b45309" : "none"}
                            className={star <= editRating ? "text-amber-700" : "text-stone-300"}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-stone-50 border border-amber-200 p-3 rounded-xl text-sm focus:border-amber-500 outline-none h-20 resize-none transition-all"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleEditCancel}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all"
                      >
                        <X size={11} /> Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(rev._id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-stone-900 rounded-full flex items-center justify-center text-amber-500 text-[10px] font-bold shrink-0">
                          {rev.userId?.userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            {rev.userId?.userName || "Anonymous"}
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={9}
                                fill={i < rev.rating ? "#f59e0b" : "none"}
                                className={i < rev.rating ? "text-amber-500" : "text-stone-200"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditStart(rev)}
                              className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => handleDelete(rev._id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed italic pl-1">
                      "{rev.comment || rev.feedback}"
                    </p>
                  </>
                )}
              </div>
            );
          })}

          {/* Show more / less */}
          {reviews.length > 2 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors py-1"
            >
              {showAll
                ? "Show Less"
                : `Show ${reviews.length - 2} More Review${reviews.length - 2 > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFeedbackPanel;