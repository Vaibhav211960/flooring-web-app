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
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import AddToCartButton from "../components/AddToCartBtn.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review States
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: "Ashok",
      comment: "The quality of the wood is impressive, perfect finish.",
      date: "2 mins ago",
    },
    {
      id: 2,
      user: "Ayush",
      comment: "Great value for money. Looks even better in person.",
      date: "1 hour ago",
    },
  ]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/products/${id}`,
        );
        const data = response.data.product || response.data;
        setProduct(data);
      } catch (err) {
        setError("The specified product could not be found in our catalog.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      user: "You", // Hardcoded for now
      comment: reviewText,
      date: "Just now",
    };

    setReviews([newReview, ...reviews]);
    setReviewText("");
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (!localStorage.getItem("UserToken")) {
      toast({
        title: "AUTHENTICATION REQUIRED",
        description:
          "Please sign in to proceed with your premium flooring purchase.",
        variant: "destructive",
      });
      navigate("/login"); // Or your login route
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
        <p className="mt-4 text-stone-500 font-serif italic tracking-wide">
          Syncing Specifications...
        </p>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col italic items-center justify-center">
        <Navbar />
        <h2 className="text-xl font-serif text-stone-800 mb-4">{error}</h2>
        <Link
          to="/products"
          className="text-amber-700 underline uppercase tracking-widest text-[10px] font-bold"
        >
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
          <Link to="/" className="hover:text-amber-700 flex items-center gap-1">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={10} />
          <Link to="/products" className="hover:text-amber-700">
            Collections
          </Link>
          <ChevronRight size={10} />
          <span className="text-stone-900 truncate max-w-[150px]">
            {product.name}
          </span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* --- LEFT: IMAGE & REVIEWS --- */}
          <div className="lg:col-span-7 space-y-12">
            <div className="aspect-square bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <img
                src={product.image}
                className="w-full h-full object-cover transition-transform duration-700"
                alt={product.name}
              />
            </div>

            <section className="space-y-8">
              <div className="flex items-center gap-2 text-amber-700 border-b border-stone-200 pb-2">
                <Info size={16} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">
                  Material Narrative
                </h3>
              </div>
              <p className="font-serif text-3xl text-stone-800 leading-tight italic">
                "{product.description}"
              </p>

              {/* --- DECENT REVIEW SECTION --- */}
              <div className="pt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Client Feedback ({reviews.length})
                  </h4>
                  <div className="flex text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="relative group">
                  <input
                    type="text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Add your experience..."
                    className="w-full bg-white border border-stone-200 p-4 pr-12 rounded-xl text-sm focus:border-amber-700 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-700 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white/60 p-5 rounded-xl border border-stone-100 flex gap-4 items-start transition-all hover:border-stone-200"
                    >
                      <div className="p-2 bg-stone-100 rounded-full text-stone-400">
                        <User size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                            {rev.user}
                          </span>
                          <span className="text-[9px] text-stone-400 font-medium uppercase tracking-tighter">
                            {rev.date}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* --- RIGHT: COMMERCE (NO UI CHANGES) --- */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-[0.4em] block">
                {product.woodType} Collection
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-stone-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-3xl font-medium text-stone-900">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-stone-500 text-sm tracking-tight">
                  / per {product.unit}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Layers size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Thickness
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.thicknessMM} mm
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Box size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Finish
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.finish}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Palette size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Color
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.color || "Natural"}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-stone-400">
                  <Warehouse size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Availability
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${product.stock > 20 ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {product.stock} {product.unit}s
                </span>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                  Order Quantity ({product.unit})
                </span>
                <div className="flex items-center bg-white border border-stone-300 rounded-md shadow-sm">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 hover:bg-stone-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-bold text-stone-900 border-x border-stone-100 min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 hover:bg-stone-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 text-[17px] font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all duration-300 border-none shadow-sm"
                >
                  <CreditCard size={22} className="text-amber-500" />
                  <span>
                    {localStorage.getItem("UserToken")
                      ? "Buy It Now"
                      : "Login to Buy"}
                  </span>
                </Button>
                <div className="mt-2">
                  <AddToCartButton
                    product={product}
                    qty={qty}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-medium font-bold">
                  <ShieldCheck size={14} className="text-emerald-500" /> Secured
                  Payment
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-medium font-bold">
                  <Zap size={14} className="text-amber-500" /> Fast Shipping
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
