import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  ChevronRight,
  Home,
  ShieldCheck,
  Zap,
  Layers,
  Box,
  Loader2,
  Palette,
  Star,
  CheckCircle2,
  Lock,
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
import Footer from "../components/Footer.jsx";
import AddToCartButton from "../components/AddToCartBtn.jsx";
// FIX: ~200 lines of review logic removed from this file
// Now imported from shared component — ProductDetails and OrderDetails
// share one ReviewPanel, bug fixed once, style changed once
import ProductFeedbackPanel from "../components/ProductFeedbackPanel";
import api from "../utils/api";
import { isLoggedIn } from "../utils/auth";

// mm → feet conversion
const mmToFt = (mm) => (mm || 0) * 0.00328084;

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback: stable fetch reference
  const fetchProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product || res.data);
    } catch {
      setError("Product not found.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // useMemo: coverage calculation — only recomputes when product or qty changes
  // OLD: was a plain function called in JSX — recomputed on every render
  const totalCoverage = useMemo(() => {
    if (!product) return "0.00";
    if (product.unit === "box")
      return ((product.coveragePerBox || 0) * qty).toFixed(2);
    const lFt = mmToFt(product.lengthMM);
    const wFt = mmToFt(product.widthMM);
    if (lFt === 0 || wFt === 0) return "N/A";
    return (qty * lFt * wFt).toFixed(2);
  }, [product, qty]);

  // useCallback: buy now handler
  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (!isLoggedIn()) {
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
  }, [product, qty, navigate]);

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
          {/* LEFT: Image + Description + Reviews */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-12">
            {/* Product Image */}
            <div className="aspect-square bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm relative">
              <img
                src={
                  Array.isArray(product.image)
                    ? product.image[1] || product.image[0]
                    : product.image ||
                      "https://directflooringonline.co.uk/wp-content/uploads/2024/02/Habitat-Oak-Glue-Down-LVT-Flooring-Bedroom-1.jpg"
                }
                className="w-full h-full object-cover"
                alt={product.name}
              />
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
            </div>

            {/* Description */}
            <section>
              <h3 className="font-serif text-2xl text-stone-800 leading-relaxed italic border-b border-stone-200 pb-6">
                "{product.description}"
              </h3>
            </section>

            {/* Reviews — shared component */}
            {/* FIX: was ~150 lines of inline review logic */}
            {/* NEW: one import, orderDelivered=true means customer can always review from product page */}
            <section className="space-y-8 pt-4">
              <div className="border-b border-stone-200 pb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-2">
                  Feedback
                </p>
                <h3 className="font-serif text-3xl text-stone-900">
                  Verified Reviews
                </h3>
              </div>
              <ProductFeedbackPanel
                productId={id}
                orderDelivered={isLoggedIn()} // on product page, any logged-in buyer can review
              />
            </section>
          </div>

          {/* RIGHT: Commerce + Specs */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-8">
            {/* Header */}
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
            </div>

            {/* Full Specs */}
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <Wrench size={14} className="text-amber-700" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
                  Full Specifications
                </span>
              </div>
              {/* Row 1: Dimensions */}
              <div className="grid grid-cols-3 border-b border-stone-100">
                {[
                  {
                    icon: <Ruler size={10} />,
                    label: "Length",
                    val: product.lengthMM ? `${product.lengthMM} mm` : null,
                    sub: product.lengthMM
                      ? `${mmToFt(product.lengthMM).toFixed(2)} ft`
                      : null,
                  },
                  {
                    icon: <Ruler size={10} />,
                    label: "Width",
                    val: product.widthMM ? `${product.widthMM} mm` : null,
                    sub: product.widthMM
                      ? `${mmToFt(product.widthMM).toFixed(2)} ft`
                      : null,
                  },
                  {
                    icon: <Layers size={10} />,
                    label: "Thickness",
                    val: product.thicknessMM
                      ? `${product.thicknessMM} mm`
                      : null,
                    sub: null,
                  },
                ].map(({ icon, label, val, sub }, i) => (
                  <div
                    key={label}
                    className={`p-4 flex flex-col gap-1 ${
                      i < 2 ? "border-r border-stone-100" : ""
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-1">
                      {icon} {label}
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {val || "N/A"}
                    </span>
                    {sub && (
                      <span className="text-[10px] text-stone-400">{sub}</span>
                    )}
                  </div>
                ))}
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
                    className={`text-xs font-semibold ${product.waterResistance === "Waterproof" ? "text-emerald-700" : product.waterResistance === "Water-resistant" ? "text-blue-700" : "text-stone-500"}`}
                  >
                    {product.waterResistance || "Not Rated"}
                  </span>
                </div>
              </div>
              {/* Row 3: Material */}
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
              {/* Row 4: Pricing */}
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
                  <div className="p-4 flex flex-col gap-1">
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

            {/* Installation badges */}
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

            {/* Action area */}
            <div className="space-y-6 pt-6 border-t border-stone-200">
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
                    onClick={() => setQty((q) => Math.max(10, q - 1))}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-mono font-bold text-stone-900 border-x border-stone-100 min-w-[3.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.max(10, q + 1))}
                    disabled={qty >= product.stock}
                    className="px-4 py-2 hover:bg-stone-100 text-stone-600 transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order Summary */}
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
                    {totalCoverage}{" "}
                    <span className="text-[10px] text-stone-400 uppercase">
                      sq.ft
                    </span>
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <button
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
                </button>

                <AddToCartButton
                  product={product}
                  qty={qty}
                  disabled={product.stock === 0 || !product.isActive}
                  className="h-14 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm"
                />
              </div>

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
