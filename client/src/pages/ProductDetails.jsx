import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CreditCard, ChevronRight, Home,
  ShieldCheck, Zap, Layers, Box, Loader2, Warehouse,
  Palette, Star, Send, CheckCircle2, Lock,
  Pencil, Trash2, X, Check, Droplets, Wrench, Maximize, Ruler,
  Package, Tag, Flame, Square, ShoppingCart,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AddToCartButton from "../components/AddToCartBtn.jsx";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function ProductDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  // ── Feedback ──────────────────────────────────────────────────────────────
  const [reviews,    setReviews]    = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating,     setRating]     = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [editText,   setEditText]   = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSaving,   setIsSaving]   = useState(false);

  const getLoggedInUserId = () => {
    try {
      const token = localStorage.getItem("UserToken");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.id || decoded._id || null;
    } catch { return null; }
  };
  const loggedInUserId = getLoggedInUserId();

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const prodRes = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(prodRes.data.product || prodRes.data);

        const reviewRes = await axios.get(`http://localhost:5000/api/feedback/product/${id}`);
        setReviews(reviewRes.data.feedbacks || []);

        const token = localStorage.getItem("UserToken");
        if (token) {
          const eligRes = await axios.get(
            `http://localhost:5000/api/feedback/verify-eligibility/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsEligible(eligRes.data.eligible);
        }
      } catch { setError("Product not found."); }
      finally { setIsLoading(false); }
    };
    if (id) fetchAll();
  }, [id]);

  // ── Feedback Handlers ─────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("UserToken");
      const res = await axios.post(
        `http://localhost:5000/api/feedback/submit`,
        { productId: id, comment: reviewText, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) => [res.data.feedback, ...prev]);
      setReviewText("");
      setIsEligible(false);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review.");
    } finally { setIsSubmitting(false); }
  };

  const handleEditStart  = (rev) => { setEditingId(rev._id); setEditText(rev.comment); setEditRating(rev.rating); };
  const handleEditCancel = ()    => { setEditingId(null); setEditText(""); setEditRating(5); };

  const handleEditSave = async (reviewId) => {
    if (!editText.trim()) return;
    try {
      setIsSaving(true);
      const token = localStorage.getItem("UserToken");
      const res = await axios.put(
        `http://localhost:5000/api/feedback/${reviewId}`,
        { comment: editText, rating: editRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? res.data.feedback : r)));
      setEditingId(null);
      toast.success("Review updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review.");
    } finally { setIsSaving(false); }
  };

  const handleDelete = (reviewId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-stone-800">Delete your review?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const token = localStorage.getItem("UserToken");
                await axios.delete(`http://localhost:5000/api/feedback/${reviewId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                setIsEligible(true);
                toast.success("Review deleted.");
              } catch (err) {
                toast.error(err.response?.data?.message || "Could not delete review.");
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
    ), { duration: 8000 });
  };

  // ── Buy Now ───────────────────────────────────────────────────────────────
  const handleBuyNow = () => {
    if (!product) return;
    if (!localStorage.getItem("UserToken")) {
      toast.error("Please sign in to continue.");
      navigate("/login");
      return;
    }
    localStorage.setItem("single_buy_product", JSON.stringify({
      productId: product._id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      unit:      product.unit,
      quantity:  qty,
      total:     product.price * qty,
    }));
    navigate(`/buy-now/${product._id}`, { state: { quantity: qty, flow: "single" } });
  };

  // ── Coverage ──────────────────────────────────────────────────────────────
  const mmToFt = (mm) => (mm || 0) * 0.00328084;

  const calculateTotalCoverage = () => {
    if (!product) return "0.00";
    if (product.unit === "box") return ((product.coveragePerBox || 0) * qty).toFixed(2);
    const lFt = mmToFt(product.lengthMM);
    const wFt = mmToFt(product.widthMM);
    if (lFt === 0 || wFt === 0) return "N/A";
    return (qty * lFt * wFt).toFixed(2);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Loading Product...</p>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-stone-700 text-lg">{error || "Product not found."}</p>
        <Link to="/products" className="text-amber-700 text-xs font-bold uppercase tracking-widest hover:underline">
          Back to Products
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      {/* ── Sticky Breadcrumb ── */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-[64px] z-20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
          <Link to="/" className="hover:text-amber-700 flex items-center gap-1 transition-colors">
            <Home size={11} /> Home
          </Link>
          <ChevronRight size={10} />
          <Link to="/products" className="hover:text-amber-700 transition-colors">Collections</Link>
          <ChevronRight size={10} />
          <span className="text-stone-600 truncate max-w-[200px]">{product.name}</span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* ══ LEFT COLUMN ══ */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-10">

            {/* Product Image */}
            <div className="aspect-square bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative">
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />

              {/* Badges — top left */}
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

              {/* Rating badge — top right */}
              {avgRating && (
                <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-sm text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                  <Star size={12} fill="#fbbf24" />
                  <span className="text-sm font-bold">{avgRating}</span>
                  <span className="text-[9px] text-stone-400">({reviews.length})</span>
                </div>
              )}
            </div>

            {/* Description Quote */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-3">About This Product</p>
              <p className="font-serif text-lg text-stone-700 leading-relaxed italic">
                "{product.description}"
              </p>
            </div>

            {/* ── Reviews Section ── */}
            <section className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-1">
                    Customer Reviews
                  </p>
                  <h3 className="font-serif text-2xl text-stone-800">What buyers say</h3>
                </div>
                <div className="text-right">
                  {avgRating ? (
                    <>
                      <p className="text-2xl font-bold text-stone-900">
                        {avgRating} <span className="text-base text-stone-400">/ 5</span>
                      </p>
                      <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">
                        {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                      </p>
                    </>
                  ) : (
                    <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">
                      No reviews yet
                    </p>
                  )}
                </div>
              </div>

              {/* Write Review */}
              {isEligible ? (
                <div className="bg-white border border-amber-100 p-6 rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      You can review this product
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                        <Star size={20} fill={star <= rating ? "#b45309" : "none"} className={star <= rating ? "text-amber-700" : "text-stone-300"} />
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleReviewSubmit} className="relative">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts on quality and finish..."
                      className="w-full bg-stone-50 border border-stone-200 p-4 pr-14 rounded-xl text-sm focus:border-amber-500 outline-none h-28 resize-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute bottom-3 right-3 bg-stone-900 text-amber-500 p-2.5 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <Lock size={13} className="text-stone-400 shrink-0" />
                  <p className="text-xs text-stone-500 italic">
                    Only verified buyers who have received this product can post reviews.
                  </p>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((rev) => {
                  const isOwner   = loggedInUserId && rev.userId?._id === loggedInUserId;
                  const isEditing = editingId === rev._id;
                  return (
                    <div
                      key={rev._id}
                      className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${
                        isEditing ? "border-amber-300" : "border-stone-100 hover:border-stone-200"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-700">
                            <Pencil size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Editing your review</span>
                          </div>
                          <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button type="button" key={star} onClick={() => setEditRating(star)} className="transition-transform hover:scale-110">
                                <Star size={18} fill={star <= editRating ? "#b45309" : "none"} className={star <= editRating ? "text-amber-700" : "text-stone-300"} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-stone-50 border border-amber-200 p-4 rounded-xl text-sm focus:border-amber-500 outline-none h-24 resize-none transition-all"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleEditCancel}
                              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all"
                            >
                              <X size={12} /> Cancel
                            </button>
                            <button
                              onClick={() => handleEditSave(rev._id)}
                              disabled={isSaving}
                              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-stone-900 rounded-full flex items-center justify-center text-amber-500 text-[10px] font-bold shrink-0">
                                {rev.userId?.userName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                                  {rev.userId?.userName || "Anonymous"}
                                  <CheckCircle2 size={11} className="text-emerald-500" />
                                </p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < rev.rating ? "#f59e0b" : "none"} className={i < rev.rating ? "text-amber-500" : "text-stone-200"} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-400">
                                {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                              {isOwner && (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => handleEditStart(rev)} className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all">
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => handleDelete(rev._id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={12} />
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
                }) : (
                  <div className="text-center py-10 border-2 border-dashed border-stone-200 rounded-2xl">
                    <p className="text-stone-400 italic text-xs tracking-widest">No reviews yet. Be the first to share your experience.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">

            {/* ── Product Identity ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.4em]">
                  {product.materialType}{product.woodType ? ` / ${product.woodType}` : ""}
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-100 px-2 py-1 rounded-md">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Price block */}
              <div className="flex items-baseline gap-3 flex-wrap pt-1">
                <div>
                  <span className="text-3xl font-medium text-stone-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-stone-400 text-sm ml-1.5">/ per {product.unit}</span>
                </div>
                {product.pricePerBox && product.unit !== "box" && (
                  <span className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1 text-xs text-amber-800 font-semibold">
                    ₹{product.pricePerBox.toLocaleString()} / box
                  </span>
                )}
              </div>

              {/* Stock pill */}
              <div className="flex items-center gap-2 pt-1">
                <div className={`h-2 w-2 rounded-full ${product.stock > 20 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"}`} />
                <span className={`text-xs font-semibold ${product.stock > 20 ? "text-emerald-700" : product.stock > 0 ? "text-amber-700" : "text-red-700"}`}>
                  {product.stock > 20
                    ? `In Stock — ${product.stock} units available`
                    : product.stock > 0
                    ? `Low Stock — only ${product.stock} left`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* ── Full Specs Matrix ── */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <Wrench size={14} className="text-amber-700" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">Full Specifications</span>
              </div>

              {/* Row 1: Dimensions */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <SpecCell label="Length" icon={<Ruler size={10} />}>
                  <span className="text-xs font-semibold text-stone-800">{product.lengthMM ? `${product.lengthMM} mm` : "N/A"}</span>
                  {product.lengthMM && <span className="text-[10px] text-stone-400">{mmToFt(product.lengthMM).toFixed(2)} ft</span>}
                </SpecCell>
                <SpecCell label="Width" icon={<Ruler size={10} />} bordered>
                  <span className="text-xs font-semibold text-stone-800">{product.widthMM ? `${product.widthMM} mm` : "N/A"}</span>
                  {product.widthMM && <span className="text-[10px] text-stone-400">{mmToFt(product.widthMM).toFixed(2)} ft</span>}
                </SpecCell>
                <SpecCell label="Thickness" icon={<Layers size={10} />} bordered>
                  <span className="text-xs font-semibold text-stone-800">{product.thicknessMM ? `${product.thicknessMM} mm` : "N/A"}</span>
                </SpecCell>
              </div>

              {/* Row 2: Appearance */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <SpecCell label="Finish" icon={<Box size={10} />}>
                  <span className="text-xs font-semibold text-stone-800">{product.finish || "Standard"}</span>
                </SpecCell>
                <SpecCell label="Color" icon={<Palette size={10} />} bordered>
                  <span className="text-xs font-semibold text-stone-800">{product.color || "Natural"}</span>
                  {product.colorFamily && <span className="text-[10px] text-stone-400">{product.colorFamily} family</span>}
                </SpecCell>
                <SpecCell label="Water Rating" icon={<Droplets size={10} />} bordered>
                  <span className={`text-xs font-semibold ${
                    product.waterResistance === "Waterproof" ? "text-emerald-700"
                    : product.waterResistance === "Water-resistant" ? "text-blue-700"
                    : "text-stone-500"
                  }`}>
                    {product.waterResistance || "Not Rated"}
                  </span>
                </SpecCell>
              </div>

              {/* Row 3: Material */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                <SpecCell label="Material" icon={<Square size={10} />}>
                  <span className="text-xs font-semibold text-stone-800">{product.materialType}</span>
                </SpecCell>
                <SpecCell label="Wood Type" icon={<Package size={10} />} bordered>
                  <span className="text-xs font-semibold text-stone-800">{product.woodType || "—"}</span>
                </SpecCell>
                <SpecCell label="Coverage/Box" icon={<Maximize size={10} />} bordered>
                  <span className="text-xs font-semibold text-stone-800">
                    {product.coveragePerBox ? `${product.coveragePerBox} sq.ft` : "N/A"}
                  </span>
                </SpecCell>
              </div>

              {/* Row 4: Pricing */}
              <div className="grid grid-cols-3">
                <SpecCell label="Unit" icon={<Tag size={10} />}>
                  <span className="text-xs font-semibold text-stone-800 uppercase">{product.unit}</span>
                </SpecCell>
                {product.pricePerBox ? (
                  <SpecCell label="Price/Box" icon={<Tag size={10} />} bordered>
                    <span className="text-xs font-semibold text-stone-800">₹{product.pricePerBox.toLocaleString()}</span>
                  </SpecCell>
                ) : <div />}
                <SpecCell label="Stock" icon={<Warehouse size={10} />} bordered>
                  <span className={`text-xs font-semibold ${product.stock > 20 ? "text-emerald-600" : product.stock > 0 ? "text-amber-600" : "text-red-600"}`}>
                    {product.stock} {product.unit}s left
                  </span>
                </SpecCell>
              </div>
            </div>

            {/* ── Install / Heat Badges ── */}
            {(product.installationMethod || product.isRadiantHeatCompatible) && (
              <div className="flex gap-3">
                {product.installationMethod && (
                  <div className="flex-1 bg-stone-100/70 border border-stone-200 rounded-xl p-3 flex items-center gap-3">
                    <Wrench size={16} className="text-stone-500 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Install Method</p>
                      <p className="text-xs font-bold text-stone-800">{product.installationMethod}</p>
                    </div>
                  </div>
                )}
                {product.isRadiantHeatCompatible && (
                  <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                    <Flame size={16} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-700">Radiant Heat</p>
                      <p className="text-xs font-bold text-amber-900">Compatible</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Action Area ── */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Configure Order</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Qty selector */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-stone-600 block">Order Quantity</span>
                    <span className="text-[10px] text-stone-400">in {product.unit}s</span>
                  </div>
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-2.5 hover:bg-white text-stone-600 font-bold transition-colors"
                    >−</button>
                    <span className="px-5 py-2.5 font-bold text-stone-900 border-x border-stone-200 min-w-[3rem] text-center">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      disabled={qty >= product.stock}
                      className="px-4 py-2.5 hover:bg-white text-stone-600 font-bold transition-colors disabled:opacity-30"
                    >+</button>
                  </div>
                </div>

                {/* Order mini-summary */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-500">Subtotal ({qty} {product.unit}s)</span>
                    <span className="text-sm font-bold text-stone-900">₹{(product.price * qty).toLocaleString()}</span>
                  </div>
                  {product.pricePerBox && product.unit !== "box" && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-stone-500">Box equivalent</span>
                      <span className="text-xs text-stone-600">
                        ~{(qty / (product.coveragePerBox || 1)).toFixed(1)} boxes
                      </span>
                    </div>
                  )}
                </div>

                {/* Coverage bar */}
                <div className="flex items-center justify-between bg-stone-900 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Maximize size={18} className="text-stone-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Est. Coverage</p>
                      <p className="text-[10px] text-stone-500 italic mt-0.5">
                        {product.unit === "box" ? "Coverage per box × qty" : "L × W × qty"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-bold text-amber-400">{calculateTotalCoverage()}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest ml-1 text-stone-500">sq.ft</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 pt-1">
                  {/* Primary — Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0 || !product.isActive}
                    className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CreditCard size={15} />
                    {!product.isActive
                      ? "Product Unavailable"
                      : product.stock === 0
                      ? "Out of Stock"
                      : localStorage.getItem("UserToken")
                      ? "Proceed to Checkout"
                      : "Sign In to Purchase"}
                  </button>

                  {/* Secondary — Add to Cart */}
                  <AddToCartButton
                    product={product}
                    qty={qty}
                    disabled={product.stock === 0 || !product.isActive}
                    className="h-12 text-[11px] rounded-xl border border-stone-200 bg-white text-stone-900 hover:bg-stone-50 font-bold uppercase tracking-widest transition-all active:scale-95"
                  />
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                    <ShieldCheck size={13} className="text-emerald-500" /> Secure Escrow
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-stone-400 uppercase font-bold tracking-widest">
                    <Zap size={13} className="text-amber-500" /> Fast Logistics
                  </div>
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

// ── Spec Cell helper ───────────────────────────────────────────────────────
function SpecCell({ label, icon, bordered = false, children }) {
  return (
    <div className={`p-4 flex flex-col gap-1 ${bordered ? "" : "border-r border-stone-100"}`}>
      <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
        {icon} {label}
      </span>
      {children}
    </div>
  );
}