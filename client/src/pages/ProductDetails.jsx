import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CreditCard, ChevronRight, Home,
  ShieldCheck, Zap, Layers, Box, Loader2, Warehouse,
  Palette, Star, Send, CheckCircle2, Lock,
  Pencil, Trash2, X, Check,
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
    } catch { return null; }
  };
  const loggedInUserId = getLoggedInUserId();

  useEffect(() => {
    const fetchProductAndReviews = async () => {
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
    if (id) fetchProductAndReviews();
  }, [id]);

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
      setReviewText(""); setIsEligible(false);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review.");
    } finally { setIsSubmitting(false); }
  };

  const handleEditStart = (rev) => { setEditingId(rev._id); setEditText(rev.comment); setEditRating(rev.rating); };
  const handleEditCancel = () => { setEditingId(null); setEditText(""); setEditRating(5); };

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
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              const token = localStorage.getItem("UserToken");
              await axios.delete(`http://localhost:5000/api/feedback/${reviewId}`, { headers: { Authorization: `Bearer ${token}` } });
              setReviews((prev) => prev.filter((r) => r._id !== reviewId));
              setIsEligible(true);
              toast.success("Review deleted.");
            } catch (err) { toast.error(err.response?.data?.message || "Could not delete review."); }
          }} className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all">Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all">Cancel</button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!localStorage.getItem("UserToken")) { toast.error("Please sign in to continue."); navigate("/login"); return; }
    const orderProduct = { _id: product._id, name: product.name, price: product.price, image: product.image, woodType: product.woodType, thicknessMM: product.thicknessMM, unit: product.unit };
    localStorage.setItem("pending_product", JSON.stringify(orderProduct));
    localStorage.setItem("pending_qty", qty);
    navigate(`/buy-now/${product._id}`, { state: { quantity: qty } });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-stone-700 text-lg">{error || "Product not found."}</p>
        <Link to="/products" className="text-amber-700 text-xs font-bold uppercase tracking-widest hover:underline">Back to Products</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      {/* Breadcrumb */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-[64px] z-20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
          <Link to="/" className="hover:text-amber-700 flex items-center gap-1 transition-colors"><Home size={11} /> Home</Link>
          <ChevronRight size={10} />
          <Link to="/products" className="hover:text-amber-700 transition-colors">Products</Link>
          <ChevronRight size={10} />
          <span className="text-stone-700 truncate max-w-[150px]">{product.name}</span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-12">
            <div className="aspect-square bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            </div>

            {/* Reviews */}
            <section className="space-y-6">
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-1">Customer Reviews</p>
                  <h3 className="font-serif text-2xl text-stone-800">What buyers say</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-stone-900">{reviews.length}</p>
                  <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">{reviews.length === 1 ? "Review" : "Reviews"}</p>
                </div>
              </div>

              {isEligible ? (
                <div className="bg-white border border-amber-100 p-6 rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">You can review this product</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}>
                        <Star size={20} fill={star <= rating ? "#b45309" : "none"} className={star <= rating ? "text-amber-700" : "text-stone-300"} />
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleReviewSubmit} className="relative">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts on quality and finish..."
                      className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-sm focus:border-amber-500 outline-none h-28 resize-none transition-all"
                    />
                    <button type="submit" disabled={isSubmitting}
                      className="absolute bottom-3 right-3 bg-stone-900 text-amber-500 p-2.5 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50">
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <Lock size={13} className="text-stone-400 shrink-0" />
                  <p className="text-xs text-stone-500 italic">Only verified buyers who have received this product can post reviews.</p>
                </div>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? reviews.map((rev) => {
                  const isOwner = loggedInUserId && rev.userId?._id === loggedInUserId;
                  const isEditing = editingId === rev._id;
                  return (
                    <div key={rev._id} className={`bg-white p-6 rounded-xl border shadow-sm transition-all ${isEditing ? "border-amber-300" : "border-stone-100 hover:border-stone-200"}`}>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-amber-700">
                            <Pencil size={12} /><span className="text-[10px] font-bold uppercase tracking-widest">Editing your review</span>
                          </div>
                          <div className="flex gap-1.5">
                            {[1,2,3,4,5].map((star) => (
                              <button key={star} onClick={() => setEditRating(star)}>
                                <Star size={18} fill={star <= editRating ? "#b45309" : "none"} className={star <= editRating ? "text-amber-700" : "text-stone-300"} />
                              </button>
                            ))}
                          </div>
                          <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-stone-50 border border-amber-200 p-4 rounded-xl text-sm focus:border-amber-500 outline-none h-24 resize-none transition-all" />
                          <div className="flex gap-2 justify-end">
                            <button onClick={handleEditCancel} className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all">
                              <X size={12} /> Cancel
                            </button>
                            <button onClick={() => handleEditSave(rev._id)} disabled={isSaving}
                              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all disabled:opacity-50">
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
                                  <button onClick={() => handleEditStart(rev)} className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"><Pencil size={12} /></button>
                                  <button onClick={() => handleDelete(rev._id)} className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-stone-600 leading-relaxed italic pl-1">"{rev.comment || rev.feedback}"</p>
                        </>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 text-stone-400 italic text-xs tracking-widest">No reviews yet.</div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.4em] block">{product.woodType} Collection</span>
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 leading-tight">{product.name}</h1>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-medium text-stone-900">₹{product.price.toLocaleString()}</span>
                <span className="text-stone-500 text-sm">/ per {product.unit}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Layers, label: "Thickness", value: `${product.thicknessMM} mm` },
                { icon: Box, label: "Finish", value: product.finish },
                { icon: Palette, label: "Color", value: product.color || "Natural" },
                { icon: Warehouse, label: "In Stock", value: `${product.stock} ${product.unit}s`, valueClass: product.stock > 20 ? "text-emerald-600" : "text-amber-600" },
              ].map(({ icon: Icon, label, value, valueClass }) => (
                <div key={label} className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Icon size={13} /><span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
                  </div>
                  <span className={`text-sm font-semibold text-stone-800 ${valueClass || ""}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-5 pt-5 border-t border-stone-200">
              <span className="mb-2 text-[1vw] text-stone-500 ml-2">minimum 10 quantity required</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Quantity ({product.unit})</span>
                <div className="flex items-center bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setQty(Math.max(10, qty - 1))} className="px-4 py-2.5 hover:bg-stone-50 text-stone-600 font-bold transition-colors">−</button>
                  <span className="px-5 py-2.5 font-bold text-stone-900 border-x border-stone-100 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.max(10, qty + 1))} className="px-4 py-2.5 hover:bg-stone-50 text-stone-600 font-bold transition-colors">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleBuyNow}
                  className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 text-sm font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-3 border-none">
                  <CreditCard size={17} className="text-amber-400" />
                  {localStorage.getItem("UserToken") ? "Buy Now" : "Sign In to Buy"}
                </Button>
                <AddToCartButton product={product} qty={qty} className="h-12 text-sm" />
              </div>

              <div className="flex items-center justify-center gap-6 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase font-bold">
                  <ShieldCheck size={13} className="text-emerald-500" /> Secure Payment
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase font-bold">
                  <Zap size={13} className="text-amber-500" /> Fast Delivery
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