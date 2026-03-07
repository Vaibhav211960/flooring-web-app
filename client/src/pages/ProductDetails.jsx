import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  ChevronRight,
  Home,
  ShieldCheck,
  Zap,
  Layers,
  Box,
  Loader2,
  Warehouse,
  Palette,
  Star,
  Send,
  CheckCircle2,
  Lock,
  Pencil,
  Trash2,
  X,
  Check,
  Droplets,
  Wrench,
  Maximize,
  Ruler,
  Package,
  Tag,
  Flame,
  Square,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import AddToCartButton from "../components/AddToCartBtn.jsx";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FEEDBACK STATES ---
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

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
  const loggedInUserId = getLoggedInUserId();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setIsLoading(true);
        const prodRes = await axios.get(
          `http://localhost:5000/api/products/${id}`,
        );
        setProduct(prodRes.data.product || prodRes.data);
        const reviewRes = await axios.get(
          `http://localhost:5000/api/feedback/product/${id}`,
        );
        setReviews(reviewRes.data.feedbacks || []);
        const token = localStorage.getItem("UserToken");
        if (token) {
          const eligRes = await axios.get(
            `http://localhost:5000/api/feedback/verify/verify-eligibility/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setIsEligible(eligRes.data.eligible);
        }
      } catch {
        setError("Product not found.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProductAndReviews();
  }, [id]);

  // --- FEEDBACK LOGIC ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("UserToken");
      const res = await axios.post(
        `http://localhost:5000/api/feedback/submit`,
        { productId: id, comment: reviewText, rating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReviews((prev) => [res.data.feedback, ...prev]);
      setReviewText("");
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
      const token = localStorage.getItem("UserToken");
      const res = await axios.put(
        `http://localhost:5000/api/feedback/${reviewId}`,
        { comment: editText, rating: editRating },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? res.data.feedback : r)),
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
          <p className="text-sm font-medium text-stone-800">
            Delete your review?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("UserToken");
                  await axios.delete(
                    `http://localhost:5000/api/feedback/${reviewId}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                  );
                  setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                  setIsEligible(true);
                  toast.success("Review deleted.");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Could not delete review.",
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
      { duration: 8000 },
    );
  };

  // --- BUY NOW LOGIC ---
  const handleBuyNow = () => {
    if (!product) return;
    if (!localStorage.getItem("UserToken")) {
      toast.error("Please sign in to continue.");
      navigate("/login");
      return;
    }
    const singleBuyData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: product.unit,
      quantity: qty,
      total: product.price * qty,
    };
    localStorage.setItem("single_buy_product", JSON.stringify(singleBuyData));
    navigate(`/buy-now/${product._id}`, {
      state: { quantity: qty, flow: "single" },
    });
  };

  // --- COVERAGE CALCULATION ---
  // Schema stores lengthMM and widthMM (in millimeters)
  // Convert to sq.ft: 1 mm = 0.00328084 ft
  const mmToFt = (mm) => (mm || 0) * 0.00328084;

  const calculateTotalCoverage = () => {
    if (!product) return "0.00";
    // If unit is "box", use coveragePerBox
    if (product.unit === "box") {
      return ((product.coveragePerBox || 0) * qty).toFixed(2);
    }
    // Otherwise calculate from dimensions
    const lFt = mmToFt(product.lengthMM);
    const wFt = mmToFt(product.widthMM);
    if (lFt === 0 || wFt === 0) return "N/A";
    return (qty * lFt * wFt).toFixed(2);
  };

  const lengthDisplay = product?.lengthMM
    ? `${product.lengthMM} mm (${mmToFt(product.lengthMM).toFixed(2)} ft)`
    : "N/A";

  const widthDisplay = product?.widthMM
    ? `${product.widthMM} mm (${mmToFt(product.widthMM).toFixed(2)} ft)`
    : "N/A";

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  if (isLoading)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="font-serif text-stone-700 text-lg">
            {error || "Product not found."}
          </p>
          <Link
            to="/products"
            className="text-amber-700 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      {/* Breadcrumb */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-[64px] z-20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
          <Link
            to="/"
            className="hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <Home size={11} /> Home
          </Link>
          <ChevronRight size={10} />
          <Link
            to="/products"
            className="hover:text-amber-700 transition-colors"
          >
            Collections
          </Link>
          <ChevronRight size={10} />
          <span className="text-stone-700 truncate max-w-[150px]">
            {product.name}
          </span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT COLUMN: Media & Reviews */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-12">
            {/* Product Image */}
            <div className="aspect-square bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative">
              <img
                src={product.image[1] || product.image[0] || "https://directflooringonline.co.uk/wp-content/uploads/2024/02/Habitat-Oak-Glue-Down-LVT-Flooring-Bedroom-1.jpg"}
                className="w-full h-full object-cover"
                alt={product.name}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.waterResistance === "Waterproof" && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md">
                    <Droplets size={12} /> Waterproof
                  </span>
                )}
                {product.waterResistance === "Water-resistant" && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-md">
                    <Droplets size={12} /> Water-Resistant
                  </span>
                )}
                {!product.isActive && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Discontinued
                  </span>
                )}
              </div>

              {/* Avg rating badge */}
              {avgRating && (
                <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-sm text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                  <Star size={12} fill="#fbbf24" />
                  <span className="text-sm font-bold">{avgRating}</span>
                  <span className="text-[9px] text-stone-400">
                    ({reviews.length})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <section>
              <h3 className="font-serif text-2xl text-stone-800 leading-relaxed italic border-b border-stone-200 pb-6">
                "{product.description}"
              </h3>
            </section>

            {/* Reviews Section */}
            <section className="space-y-8 pt-4">
              <div className="border-b border-stone-200 pb-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-2">
                    Feedback
                  </p>
                  <h3 className="font-serif text-3xl text-stone-900">
                    Verified Reviews
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-light text-stone-900">
                    {avgRating || "0.0"}{" "}
                    <span className="text-sm text-stone-400">/ 5.0</span>
                  </p>
                  <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">
                    {reviews.length} Total
                  </p>
                </div>
              </div>

              {isEligible ? (
                <div className="bg-white border border-stone-200 p-8 rounded-2xl shadow-sm space-y-6">
                  <div className="flex items-center gap-2 text-stone-900">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Write a review
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={22}
                          fill={star <= rating ? "#f59e0b" : "none"}
                          className={
                            star <= rating ? "text-amber-500" : "text-stone-200"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleReviewSubmit} className="relative">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Describe the texture, finish, and overall quality..."
                      className="w-full bg-stone-50 border border-stone-200 p-5 rounded-xl text-sm focus:ring-1 focus:ring-stone-900 outline-none h-32 resize-none transition-all placeholder:text-stone-400"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute bottom-4 right-4 bg-stone-900 text-stone-50 p-3 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {isSubmitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-5 bg-stone-100/50 rounded-xl border border-stone-200/60">
                  <Lock size={12} className="text-stone-400" />
                  <p className="text-[11px] text-stone-500 font-medium italic">
                    Reviews are restricted to verified purchasers only.
                  </p>
                </div>
              )}

              <div className="grid gap-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => {
                    const isOwner =
                      loggedInUserId && rev.userId?._id === loggedInUserId;
                    const isEditing = editingId === rev._id;
                    return (
                      <div
                        key={rev._id}
                        className={`group bg-white p-6 rounded-2xl border transition-all duration-300 ${isEditing ? "border-amber-400 ring-4 ring-amber-50" : "border-stone-100 hover:border-stone-300 hover:shadow-md"}`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setEditRating(star)}
                                >
                                  <Star
                                    size={18}
                                    fill={
                                      star <= editRating ? "#f59e0b" : "none"
                                    }
                                    className={
                                      star <= editRating
                                        ? "text-amber-500"
                                        : "text-stone-200"
                                    }
                                  />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-sm focus:ring-1 focus:ring-stone-900 outline-none h-24 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleEditCancel}
                                className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditSave(rev._id)}
                                disabled={isSaving}
                                className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-50 bg-stone-900 rounded-lg hover:bg-stone-800 transition-all"
                              >
                                {isSaving ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  "Save Changes"
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-stone-100 border border-stone-200 rounded-full flex items-center justify-center text-stone-900 text-xs font-bold uppercase">
                                  {rev.userId?.userName?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-stone-900 tracking-tight flex items-center gap-2">
                                    {rev.userId?.userName || "Anonymous"}
                                    <span className="h-1 w-1 bg-stone-300 rounded-full" />
                                    <span className="text-[10px] text-stone-400 font-normal">
                                      Verified Buyer
                                    </span>
                                  </p>
                                  <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={10}
                                        fill={
                                          i < rev.rating ? "#f59e0b" : "none"
                                        }
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
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-medium text-stone-400 uppercase tracking-tighter">
                                  {new Date(rev.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                                {isOwner && (
                                  <div className="flex items-center border-l border-stone-100 pl-4 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditStart(rev)}
                                      className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-all"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(rev._id)}
                                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed font-serif pl-14 italic">
                              "{rev.comment || rev.feedback}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
                    <p className="text-[11px] text-stone-400 uppercase font-bold tracking-[0.2em]">
                      No feedback yet
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Commerce & Specs */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-8">
            {/* Header Block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.4em]">
                  {product.materialType}
                  {product.woodType ? ` / ${product.woodType}` : ""}
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-100 px-2 py-1 rounded-md">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 flex-wrap">
                <div>
                  <span className="text-3xl font-medium text-stone-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-stone-500 text-sm ml-1">
                    / per {product.unit}
                  </span>
                </div>
                {product.pricePerBox && product.unit !== "box" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1">
                    <span className="text-xs text-amber-800 font-semibold">
                      ₹{product.pricePerBox.toLocaleString()} / box
                    </span>
                  </div>
                )}
              </div>

              {/* Stock indicator */}
              
            </div>

            {/* Full Specs Matrix */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <Wrench size={14} className="text-amber-700" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
                  Full Specifications
                </span>
              </div>

              {/* Row 1: Dimensions */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Ruler size={10} /> Length
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.lengthMM ? `${product.lengthMM} mm` : "N/A"}
                  </span>
                  {product.lengthMM && (
                    <span className="text-[10px] text-stone-400">
                      {mmToFt(product.lengthMM).toFixed(2)} ft
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Ruler size={10} /> Width
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.widthMM ? `${product.widthMM} mm` : "N/A"}
                  </span>
                  {product.widthMM && (
                    <span className="text-[10px] text-stone-400">
                      {mmToFt(product.widthMM).toFixed(2)} ft
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Layers size={10} /> Thickness
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.thicknessMM ? `${product.thicknessMM} mm` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Row 2: Appearance */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Box size={10} /> Finish
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.finish || "Standard"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Palette size={10} /> Color
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.color || "Natural"}
                  </span>
                  {product.colorFamily && (
                    <span className="text-[10px] text-stone-400">
                      {product.colorFamily} family
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Droplets size={10} /> Water Rating
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      product.waterResistance === "Waterproof"
                        ? "text-emerald-700"
                        : product.waterResistance === "Water-resistant"
                          ? "text-blue-700"
                          : "text-stone-500"
                    }`}
                  >
                    {product.waterResistance || "Not Rated"}
                  </span>
                </div>
              </div>

              {/* Row 3: Material & Coverage */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Square size={10} /> Material
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.materialType}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Package size={10} /> Wood Type
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.woodType || "—"}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Maximize size={10} /> Coverage/Box
                  </span>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.coveragePerBox
                      ? `${product.coveragePerBox} sq.ft`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Row 4: Pricing & Unit */}
              <div className="grid grid-cols-3">
                <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                    <Tag size={10} /> Unit
                  </span>
                  <span className="text-xs font-semibold text-stone-800 uppercase">
                    {product.unit}
                  </span>
                </div>
                {product.pricePerBox && (
                  <div className="p-4 flex flex-col gap-1 border-r border-stone-100">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                      <Tag size={10} /> Price/Box
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      ₹{product.pricePerBox.toLocaleString()}
                    </span>
                  </div>
                )}
              
              </div>
            </div>

            {/* Installation & Heating badges */}
            {(product.installationMethod ||
              product.isRadiantHeatCompatible) && (
              <div className="flex gap-3">
                {product.installationMethod && (
                  <div className="flex-1 bg-stone-100/70 border border-stone-200 rounded-xl p-3 flex items-center gap-3">
                    <Wrench size={16} className="text-stone-500 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">
                        Install Method
                      </p>
                      <p className="text-xs font-bold text-stone-800">
                        {product.installationMethod}
                      </p>
                    </div>
                  </div>
                )}
                {product.isRadiantHeatCompatible && (
                  <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                    <Flame size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700">
                        Radiant Heat
                      </p>
                      <p className="text-xs font-bold text-amber-900">
                        Compatible
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION AREA */}
            <div className="space-y-6 pt-6 border-t border-stone-200">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 block">
                    Quantity
                  </span>
                  <span className="text-[10px] text-stone-400 italic">
                    Units in {product.unit}s
                  </span>
                </div>
                <div className="flex items-center bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(10, qty - 1))}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-mono font-bold text-stone-900 border-x border-stone-100 min-w-[3.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.max(10, qty + 1))}
                    disabled={qty >= product.stock}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-stone-500">
                    Subtotal
                  </span>
                  <span className="text-sm font-bold text-stone-900">
                    ₹{(product.price * qty).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-200/60">
                  <div className="flex items-center gap-2">
                    <Maximize size={14} className="text-stone-400" />
                    <span className="text-xs font-medium text-stone-500">
                      Coverage
                    </span>
                  </div>
                  <span className="text-sm font-bold text-stone-900">
                    {calculateTotalCoverage()}{" "}
                    <span className="text-[10px] text-stone-400 uppercase">
                      sq.ft
                    </span>
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || !product.isActive}
                  className="w-full h-14 bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  <CreditCard size={16} className="text-amber-500" />
                  {!product.isActive
                    ? "Unavailable"
                    : product.stock === 0
                      ? "Out of Stock"
                      : "Proceed to Checkout"}
                </Button>

                <AddToCartButton
                  product={product}
                  qty={qty}
                  disabled={product.stock === 0 || !product.isActive}
                  className="h-14 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-black border border-stone-200 text-stone-900 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
                />
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="flex items-center gap-2 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                  <ShieldCheck size={14} className="text-stone-300" /> Secure
                  Payment
                </div>
                <div className="flex items-center gap-2 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                  <Zap size={14} className="text-stone-300" /> Inspected Quality
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
