import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Home as HomeIcon,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  Download,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Hash,
  Loader2,
  Star,
  Send,
  Lock,
  Pencil,
  Trash2,
  X,
  Check,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

// ─── Helper: get logged-in user id from token ──────────────────────────────
const getLoggedInUserId = () => {
  try {
    const token = localStorage.getItem("UserToken");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.id || decoded._id || null;
  } catch {
    return null;
  }
};

// ─── Sub-component: Feedback panel per product ─────────────────────────────
function ProductFeedbackPanel({ productId, productName, orderDelivered }) {
  const loggedInUserId = getLoggedInUserId();
  const token = localStorage.getItem("UserToken");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);

  // Submit state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Expand/collapse reviews list
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setReviewsLoading(true);
        const reviewRes = await axios.get(
          `http://localhost:5000/api/feedback/product/${productId}`
        );
        setReviews(reviewRes.data.feedbacks || []);

        if (token && orderDelivered) {
          const eligRes = await axios.get(
            `http://localhost:5000/api/feedback/verify/verify-eligibility/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsEligible(eligRes.data.eligible);
        }
      } catch {
        // silently fail — reviews are non-critical
      } finally {
        setReviewsLoading(false);
      }
    };
    if (productId) load();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `http://localhost:5000/api/feedback/submit`,
        { productId, comment: reviewText, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
  };

  const handleEditStart = (rev) => {
    setEditingId(rev._id);
    setEditText(rev.comment);
    setEditRating(rev.rating);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  };

  const handleEditSave = async (reviewId) => {
    if (!editText.trim()) return;
    try {
      setIsSaving(true);
      const res = await axios.put(
        `http://localhost:5000/api/feedback/${reviewId}`,
        { comment: editText, rating: editRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? res.data.feedback : r))
      );
      setEditingId(null);
      toast.success("Review updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (reviewId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Delete your review?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await axios.delete(
                    `http://localhost:5000/api/feedback/${reviewId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                  setIsEligible(true);
                  toast.success("Review deleted.");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Could not delete review."
                  );
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const visibleReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <div className="border-t border-stone-100 pt-6 mt-2 space-y-5">
      {/* Panel header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-amber-700" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
            Reviews for {productName}
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

      {/* Submit form — only if order is delivered and user is eligible */}
      {orderDelivered && token && isEligible && (
        <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              You can review this product
            </span>
          </div>

          {/* Star rating picker */}
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
                  className={
                    star <= rating ? "text-amber-700" : "text-stone-300"
                  }
                />
              </button>
            ))}
          </div>

          <form onSubmit={handleReviewSubmit} className="relative">
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
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Lock message — delivered but already reviewed or not logged in */}
      {orderDelivered && token && !isEligible && reviews.length === 0 && !reviewsLoading && (
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <p className="text-xs text-stone-500 italic">
            No reviews yet. You have already reviewed this product.
          </p>
        </div>
      )}

      {/* Not delivered message */}
      {!orderDelivered && token && (
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <p className="text-xs text-stone-500 italic">
            You can leave a review once this order is delivered.
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviewsLoading ? (
        <div className="flex items-center gap-2 py-4 text-stone-400">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs italic text-stone-400 py-2">
          No reviews yet for this product.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((rev) => {
            const isOwner =
              loggedInUserId && rev.userId?._id === loggedInUserId;
            const isEditing = editingId === rev._id;

            return (
              <div
                key={rev._id}
                className={`bg-white p-5 rounded-xl border shadow-sm transition-all ${
                  isEditing
                    ? "border-amber-300"
                    : "border-stone-100 hover:border-stone-200"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Pencil size={11} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Editing your review
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setEditRating(star)}
                        >
                          <Star
                            size={17}
                            fill={star <= editRating ? "#b45309" : "none"}
                            className={
                              star <= editRating
                                ? "text-amber-700"
                                : "text-stone-300"
                            }
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
                        {isSaving ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Check size={11} />
                        )}{" "}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 bg-stone-900 rounded-full flex items-center justify-center text-amber-500 text-[10px] font-bold shrink-0">
                          {rev.userId?.userName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                            {rev.userId?.userName || "Anonymous"}
                            <CheckCircle2
                              size={10}
                              className="text-emerald-500"
                            />
                          </p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={9}
                                fill={i < rev.rating ? "#f59e0b" : "none"}
                                className={
                                  i < rev.rating
                                    ? "text-amber-500"
                                    : "text-stone-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
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
}

// ─── Main OrderDetails component ───────────────────────────────────────────
export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("UserToken")}`,
            },
          }
        );
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const generateInvoice = () => {
    try {
      setIsGenerating(true);
      const doc = new jsPDF();

      // --- 1. Top Branding Header ---
      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("serif", "bold");
      doc.setFontSize(26);
      doc.text("INSCAPE LAYERS", 14, 25);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text("Engineered for life. Premium Flooring Solutions.", 14, 32);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(251, 191, 36);
      doc.text("OFFICIAL MATERIAL MANIFEST", 196, 25, { align: "right" });

      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Ref: ${order._id.toUpperCase()}`, 196, 32, { align: "right" });

      // --- 2. Contact & Shipping Columns ---
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("FROM:", 14, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        [
          "Inscape Layers India",
          "123 Market Square,",
          "Ahmedabad, GJ 380001",
          "Contact: +91 98765 43210",
          "Email: sales@inscapefloors.com",
        ],
        14,
        67
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("SHIP TO / BILL TO:", 120, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const addressLines = doc.splitTextToSize(
        order.shippingAddress.address,
        75
      );
      doc.text(
        [
          order.shippingAddress.fullName.toUpperCase(),
          ...addressLines,
          `Pincode: ${order.shippingAddress.pincode}`,
          `Contact: ${order.shippingAddress.contact}`,
        ],
        120,
        67
      );

      // --- 3. Items Table ---
      const tableRows = order.items.map((item, index) => [
        index + 1,
        {
          content: item.productName.toUpperCase(),
          styles: { fontStyle: "bold" },
        },
        item.units,
        `INR ${Number(item.pricePerUnit).toLocaleString("en-IN")}`,
        `INR ${Number(item.totalAmount).toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: 100,
        head: [
          ["SR.", "DESCRIPTION OF MATERIAL", "QTY", "UNIT RATE", "TOTAL AMOUNT"],
        ],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: [28, 25, 23],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          2: { halign: "center", cellWidth: 20 },
          3: { halign: "right", cellWidth: 40 },
          4: { halign: "right", cellWidth: 40 },
        },
        styles: { fontSize: 8, cellPadding: 4 },
      });

      // --- 4. Summary ---
      const finalY = doc.lastAutoTable.finalY + 15;

      doc.setFillColor(252, 251, 247);
      doc.setDrawColor(231, 229, 228);
      doc.rect(120, finalY - 5, 76, 25, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("NET SETTLEMENT:", 125, finalY + 5);
      doc.setTextColor(180, 83, 9);
      doc.text(
        `INR ${Number(order.netBill).toLocaleString("en-IN")}`,
        190,
        finalY + 5,
        { align: "right" }
      );

      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Payment: ${order.paymentMode} - ${
          order.paymentId?.substring(0, 10) || "SECURED"
        }`,
        125,
        finalY + 13
      );

      // --- 5. Footer ---
      doc.setDrawColor(200);
      doc.line(14, 272, 196, 272);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 25, 23);
      doc.text("QUALITY ASSURED", 14, 278);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(
        "All Inscape products are industry certified for durability and meet global safety standards.",
        14,
        282
      );
      doc.text(
        "Page 1/1 - System Generated Material Manifest for Inscape Layers Customer Fulfillment.",
        105,
        290,
        { align: "center" }
      );

      doc.save(`Inscape_Invoice_${order._id.slice(-6)}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate manifest. Please check data.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-amber-600" size={40} />
          <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
            Retrieving Manifest...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // --- Not Found State ---
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-6 py-24 border-2 border-dashed border-stone-200 rounded-2xl px-12">
            <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="h-6 w-6 text-stone-400" />
            </div>
            <p className="font-serif text-2xl text-stone-400 italic">
              Order not found
            </p>
            <Link
              to="/order-history"
              className="inline-block text-amber-700 font-bold uppercase tracking-[0.2em] text-[10px] hover:underline"
            >
              Return to Logs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isDelivered = order.orderStatus === "delivered";

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link
              to="/"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link
              to="/order-history"
              className="hover:text-white transition-colors"
            >
              History
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Detail Log</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
                Order Details
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-2">
                Order{" "}
                <span className="italic text-amber-400">
                  #{order._id.slice(-6)}
                </span>
              </h1>
              <p className="text-stone-400 text-sm uppercase tracking-wider font-medium">
                {order.paymentMode} Transaction •{" "}
                {new Date(order.orderDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={generateInvoice}
              disabled={isGenerating}
              className="flex items-center gap-2 h-12 px-6 border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin h-3 w-3" />
              ) : (
                <Download size={14} />
              )}
              {isGenerating ? "Generating..." : "Download Invoice"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Delivery Progress */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <div className="px-0 pb-6 border-b border-stone-100 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 flex items-center gap-2">
                  <Truck size={14} /> Delivery Progress
                </p>
              </div>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 w-full h-[2px] bg-stone-100 -z-0" />
                <StatusStep
                  icon={<CheckCircle2 size={18} />}
                  label="Confirmed"
                  sub="Placed"
                  active
                />
                <StatusStep
                  icon={<Package size={18} />}
                  label="Processing"
                  sub="Warehouse"
                  active={order.orderStatus !== "pending"}
                />
                <StatusStep
                  icon={<Truck size={18} />}
                  label="In Transit"
                  sub="Shipping"
                  active={
                    order.orderStatus === "arriving" ||
                    order.orderStatus === "delivered"
                  }
                />
                <StatusStep
                  icon={<HomeIcon size={18} />}
                  label="Delivered"
                  sub="Project Site"
                  active={order.orderStatus === "delivered"}
                />
              </div>
            </div>

            {/* Product Manifest + Feedback per item */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Product Manifest
                </p>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  Tx ID: {order.paymentId?.slice(-8) || "—"}
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-8">
                    {/* Product row */}
                    <div className="flex flex-col md:flex-row gap-6 items-center group">
                      <div className="h-20 w-20 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shrink-0">
                        <Package size={32} strokeWidth={1} />
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h4 className="font-bold text-stone-800 text-lg leading-tight mb-1">
                          {item.productName}
                        </h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                          Product Ref: {item.productId?.slice(-6) || "—"}
                        </p>
                      </div>
                      <div className="text-center md:text-right shrink-0">
                        <p className="text-xs text-stone-500 mb-1 font-medium italic">
                          ₹{item.pricePerUnit} per unit × {item.units}
                        </p>
                        <p className="font-serif font-bold text-xl text-stone-900">
                          ₹{item.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ── Feedback panel for this product ── */}
                    <ProductFeedbackPanel
                      productId={item.productId}
                      productName={item.productName}
                      orderDelivered={isDelivered}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Destination Details */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 flex items-center gap-2">
                  <MapPin size={14} /> Destination Details
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-amber-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-1">
                      Recipient
                    </p>
                    <p className="text-sm font-bold text-stone-800 uppercase italic">
                      {order.shippingAddress.fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-amber-600 mt-1 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest mb-1">
                      Site Address
                    </p>
                    <p className="text-sm font-medium text-stone-600 leading-relaxed uppercase italic">
                      {order.shippingAddress.address}
                      {order.shippingAddress.landmark && (
                        <>
                          <br />
                          Landmark: {order.shippingAddress.landmark}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-stone-300 shrink-0" />
                    <span className="text-xs font-bold text-stone-700">
                      {order.shippingAddress.contact}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-stone-300 shrink-0" />
                    <span className="text-xs font-bold text-stone-700">
                      {order.shippingAddress.pincode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-stone-900 text-stone-50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-800">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                  <CreditCard size={14} /> Financial Summary
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">
                    Gross Bill
                  </span>
                  <span className="font-bold">
                    ₹{order.netBill.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400 font-medium tracking-wide">
                    Shipping Fee
                  </span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                    Included
                  </span>
                </div>
                <div className="pt-4 border-t border-stone-800 flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    Total Amount
                  </span>
                  <span className="text-3xl font-serif font-bold text-amber-500">
                    ₹{order.netBill.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <Link
              to="/order-history"
              className="flex items-center justify-center gap-2 w-full py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to History
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatusStep({ icon, label, sub, active = false }) {
  return (
    <div className="flex flex-col items-center gap-2 relative z-10">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
          active
            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200"
            : "bg-white border-stone-100 text-stone-300"
        }`}
      >
        {icon}
      </div>
      <div className="text-center">
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            active ? "text-stone-900" : "text-stone-400"
          }`}
        >
          {label}
        </p>
        <p className="text-[9px] text-stone-400 font-medium">{sub}</p>
      </div>
    </div>
  );
}