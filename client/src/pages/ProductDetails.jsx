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
  Ruler,
  Layers,
  Box,
  Info,
  Loader2,
  Warehouse,
  Palette,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import BuyNow from "./buyNow";
import AddToCartButton from "../components/AddToCartBtn.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/products/${id}`,
        );
        // Extracting data based on your specific schema keys
        const data = response.data.product || response.data;
        setProduct(data);
        console.log("Fetched product:", typeof data, data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("The specified product could not be found in our catalog.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!product) return;
    navigate(`/buy-now/${product._id}`, { state: { quantity: qty } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-amber-600 animate-spin" />
        <p className="mt-4 text-stone-500 font-serif italic tracking-wide">
          Syncing Specifications...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
          <h2 className="text-2xl font-serif text-stone-800 mb-4">{error}</h2>
          <Link
            to="/products"
            className="text-amber-700 underline uppercase tracking-[0.2em] text-[10px] font-bold"
          >
            Return to Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900">
      <Navbar />

      {/* --- Breadcrumb --- */}
      <nav className="border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-[64px] z-20">
        <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400">
          <Link
            to="/"
            className="hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <Home className="h-3 w-3" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-amber-700">
            Collections
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-900 font-bold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </nav>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* --- LEFT: IMAGE & DESC --- */}
          <div className="lg:col-span-7 space-y-12">
            <div className="aspect-square bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <img
                src={product.image}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                alt={product.name}
              />
            </div>

            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 text-amber-700">
                <Info className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Material Narrative
                </h3>
              </div>
              <p className="font-serif text-2xl md:text-3xl text-stone-800 leading-snug italic">
                "{product.description}"
              </p>
              <div className="h-px bg-gradient-to-r from-stone-200 to-transparent w-full" />
              <p className="text-stone-600 leading-relaxed max-w-2xl">
                This {product.woodType} selection is processed with a{" "}
                {product.finish} finish, ensuring a high-end architectural look.
                Categorized under ID: {product.subCategoryId.name}, this product
                meets our strict industrial standards for {product.unit}{" "}
                distribution.
              </p>
            </section>
          </div>

          {/* --- RIGHT: COMMERCE --- */}
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
                  ₹{product.price}
                </span>
                <span className="text-stone-500 text-sm tracking-tight">
                  / per {product.unit}
                </span>
              </div>
            </div>

            {/* Grid Mapped to Schema Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white border border-stone-200">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
                  <Layers size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Thickness
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.thicknessMM} mm
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
                  <Box size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Finish
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.finish}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
                  <Palette size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">
                    Color
                  </span>
                </div>
                <span className="text-sm font-semibold text-stone-800">
                  {product.color || "Natural"}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-white border border-stone-200">
                <div className="flex items-center gap-2 text-stone-400 mb-1">
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
                    className="px-4 py-2 hover:bg-stone-50 text-stone-400"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-bold text-stone-900 border-x border-stone-100 min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 hover:bg-stone-50 text-stone-400"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 text-sm font-bold uppercase tracking-widest rounded-md flex items-center justify-center gap-3"
                >
                  <CreditCard size={18} />
                  {localStorage.getItem("token")
                    ? "Buy Now with Razorpay"
                    : "Login to Purchase"}
                </Button>
                <div className="mt-8">
                  <AddToCartButton product={product} className="h-12 text-lg" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 py-2">
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-medium">
                  <ShieldCheck size={14} className="text-emerald-500" /> Secured
                  Payment
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 uppercase font-medium">
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
