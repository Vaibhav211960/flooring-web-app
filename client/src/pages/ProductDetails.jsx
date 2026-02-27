import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart,
  CreditCard,
  ChevronRight,
  Home,
  ShieldCheck,
  Zap,
  Layers,
  Box,
  Info,
  Loader2,
  Warehouse,
  Palette,
  Star,
  Send,
  User,
  CheckCircle2,
  Lock,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import AddToCartButton from "../components/AddToCartBtn.jsx";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode"; // ✅ npm install jwt-decode if not already installed

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Feedback States ---
  const [reviews, setReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Edit States ---
  const [editingId, setEditingId] = useState(null);       // Which review is being edited
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // --- Get logged-in user's ID from token ---
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
      } catch (err) {
        setError("The specified product could not be found.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProductAndReviews();
  }, [id]);

  // --- Submit new review ---
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
      toast.success("Feedback published successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Start editing a review ---
  const handleEditStart = (rev) => {
    setEditingId(rev._id);
    setEditText(rev.comment);
    setEditRating(rev.rating);
  };

  // --- Cancel editing ---
  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  };

  // --- Save edited review ---
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
      // Replace updated review in list instantly
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? res.data.feedback : r))
      );
      setEditingId(null);
      toast.success("Review updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Delete review ---
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      const token = localStorage.getItem("UserToken");
      await axios.delete(`http://localhost:5000/api/feedback/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setIsEligible(true); // Allow them to re-submit after deleting
      toast.success("Review deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!localStorage.getItem("UserToken")) {
      toast.error("Please sign in to proceed.");
      navigate("/login");
      return;
    }
    const orderProduct = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      woodType: product.woodType,
      thicknessMM: product.thicknessMM,
      unit: product.unit,
    };
    localStorage.setItem("pending_product", JSON.stringify(orderProduct));
    localStorage.setItem("pending_qty", qty);
    navigate(`/buy-now/${product._id}`, { state: { quantity: qty } });
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center pt-20">
        <Navbar />
        <h2 className="text-xl font-serif text-stone-800 mb-4">{error}</h2>
        <Link to="/products" className="text-amber-700 underline text-[10px] font-bold uppercase tracking-widest">
          Return to Collections
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      {/* --- Breadcrumb --- */}
      <nav className="border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-[64px] z-20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
          <Link to="/" className="hover:text-amber-700 flex items-center gap-1"><Home size={12} /> Home</Link>
          <ChevronRight size={10} />
          <Link to="/products" className="hover:text-amber-700">Collections</Link>
          <ChevronRight size={10} />
          <span className="text-stone-900 truncate max-w-[150px]">{product.name}</span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* --- LEFT SIDE --- */}
          <div className="lg:col-span-7 space-y-12">
            <div className="aspect-square bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            </div>

            {/* --- FEEDBACK SECTION --- */}
            <section className="space-y-8">
              <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700 mb-1">Authentic Reviews</h3>
                  <p className="font-serif text-2xl text-stone-800 italic">User Experience Ledger</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-stone-900">{reviews.length}</p>
                  <p className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">Total Reviews</p>
                </div>
              </div>

              {/* Submit new review — only for eligible users */}
              {isEligible ? (
                <div className="bg-white border border-amber-100 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">You are eligible to review this purchase</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}>
                        <Star size={20} fill={star <= rating ? "#b45309" : "none"} className={star <= rating ? "text-amber-700" : "text-stone-200"} />
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleReviewSubmit} className="relative">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts on the texture and quality..."
                      className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-sm focus:border-amber-700 outline-none h-28 resize-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute bottom-3 right-3 bg-stone-900 text-amber-500 p-2.5 rounded-lg hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-stone-100/50 rounded-xl border border-stone-200">
                  <Lock size={14} className="text-stone-400" />
                  <p className="text-[11px] text-stone-500 font-medium italic">Only verified owners who have received this product can post reviews.</p>
                </div>
              )}

              {/* All reviews */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => {
                    const isOwner = loggedInUserId && rev.userId?._id === loggedInUserId;
                    const isEditing = editingId === rev._id;

                    return (
                      <div
                        key={rev._id}
                        className={`bg-white p-6 rounded-xl border transition-all shadow-sm ${
                          isEditing ? "border-amber-300" : "border-stone-100 hover:border-stone-200"
                        }`}
                      >
                        {isEditing ? (
                          /* ---- EDIT MODE ---- */
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-700 mb-1">
                              <Pencil size={13} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Editing your review</span>
                            </div>

                            {/* Star rating editor */}
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setEditRating(star)}>
                                  <Star
                                    size={18}
                                    fill={star <= editRating ? "#b45309" : "none"}
                                    className={star <= editRating ? "text-amber-700" : "text-stone-200"}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Text editor */}
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full bg-stone-50 border border-amber-200 p-4 rounded-xl text-sm focus:border-amber-700 outline-none h-24 resize-none transition-all"
                            />

                            {/* Save / Cancel */}
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleEditCancel}
                                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all"
                              >
                                <X size={13} /> Cancel
                              </button>
                              <button
                                onClick={() => handleEditSave(rev._id)}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white bg-stone-900 rounded-lg hover:bg-black transition-all disabled:opacity-50"
                              >
                                {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ---- VIEW MODE ---- */
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-stone-900 rounded-full flex items-center justify-center text-amber-500 text-[10px] font-bold">
                                  {rev.userId?.userName?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                                    {rev.userId?.userName || "Anonymous"}
                                    <CheckCircle2 size={12} className="text-emerald-500" title="Verified Purchase" />
                                  </p>
                                  <div className="flex mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={10} fill={i < rev.rating ? "#f59e0b" : "none"} className={i < rev.rating ? "text-amber-500" : "text-stone-200"} />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>

                                {/* Edit / Delete — only for the review owner */}
                                {isOwner && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditStart(rev)}
                                      className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                                      title="Edit review"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(rev._id)}
                                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Delete review"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-stone-600 leading-relaxed italic font-serif pl-1">
                              "{rev.comment || rev.feedback}"
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-stone-400 italic text-xs tracking-widest">
                    No verified reviews yet.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* --- RIGHT SIDE: Product Info (UNTOUCHED) --- */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.4em] block">{product.woodType} Collection</span>
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 leading-tight">{product.name}</h1>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-medium text-stone-900">₹{product.price.toLocaleString()}</span>
                <span className="text-stone-500 text-sm tracking-tight">/ per {product.unit}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400"><Layers size={14} /><span className="text-[9px] uppercase tracking-widest font-bold">Thickness</span></div>
                <span className="text-sm font-semibold text-stone-800">{product.thicknessMM} mm</span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400"><Box size={14} /><span className="text-[9px] uppercase tracking-widest font-bold">Finish</span></div>
                <span className="text-sm font-semibold text-stone-800">{product.finish}</span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400"><Palette size={14} /><span className="text-[9px] uppercase tracking-widest font-bold">Color</span></div>
                <span className="text-sm font-semibold text-stone-800">{product.color || "Natural"}</span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400"><Warehouse size={14} /><span className="text-[9px] uppercase tracking-widest font-bold">Availability</span></div>
                <span className={`text-sm font-semibold ${product.stock > 20 ? "text-emerald-600" : "text-amber-600"}`}>{product.stock} {product.unit}s</span>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Order Quantity ({product.unit})</span>
                <div className="flex items-center bg-white border border-stone-300 rounded-md shadow-sm">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-stone-50">-</button>
                  <span className="px-6 py-2 font-bold text-stone-900 border-x border-stone-100 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-stone-50">+</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleBuyNow} className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 text-[17px] font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 border-none shadow-sm">
                  <CreditCard size={22} className="text-amber-500" />
                  <span>{localStorage.getItem("UserToken") ? "Buy It Now" : "Login to Buy"}</span>
                </Button>
                <div className="mt-2">
                  <AddToCartButton product={product} qty={qty} className="h-12 text-lg" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-bold"><ShieldCheck size={14} className="text-emerald-500" /> Secured Payment</div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-bold"><Zap size={14} className="text-amber-500" /> Fast Shipping</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}