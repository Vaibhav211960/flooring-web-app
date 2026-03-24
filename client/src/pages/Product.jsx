import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ChevronRight, Home as HomeIcon, Search, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";

export default function Product() {
  const [products,  setProducts]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  // useCallback: stable fetch reference — not recreated on every render
  // FIX: was plain async in useEffect — no way to retry without page reload
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/products");
      setProducts(res.data.products || res.data || []);
    } catch {
      // FIX: was console.error — user saw nothing. Now sets error state for UI
      setError("Failed to load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // useMemo: filter only recomputes when products or search changes
  // OLD: plain .filter() in render body — ran on EVERY render
  // NEW: cached result — only recomputes when inputs change
  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(s) ||
      p.materialType?.toLowerCase().includes(s) ||
      p.finish?.toLowerCase().includes(s)
    );
  }, [products, search]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Products</span>
          </nav>
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">Our Catalog</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Premium <span className="italic text-amber-400">Flooring</span>
            </h1>
            <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-xl">
              Browse our full range of hardwood, vinyl, and laminate flooring —
              direct from manufacturers at honest prices.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Search */}
      <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, material or finish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-100 border border-transparent rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-stone-400"
            />
          </div>
          <span className="text-xs text-stone-400 font-medium">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" /> Loading...
              </span>
            ) : (
              <><span className="text-stone-900 font-bold">{filteredProducts.length}</span> products</>
            )}
          </span>
        </div>
      </div>

      {/* Grid */}
      <main className="flex-grow container max-w-7xl mx-auto px-6 py-12 md:py-16">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin mb-4" />
            <p className="text-stone-400 text-sm italic tracking-widest">Loading products...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="max-w-sm mx-auto text-center py-14 bg-red-50 rounded-2xl border border-red-100 px-6">
            <p className="text-red-700 font-medium text-sm mb-4">{error}</p>
            {/* FIX: was window.location.reload() — hard page reload kills React state */}
            {/* NEW: calls fetchProducts() which is a stable useCallback reference */}
            <button
              onClick={fetchProducts}
              className="px-6 h-10 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
              <div className="bg-stone-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-stone-400" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">No products found</h3>
              <p className="text-stone-500 text-sm">No results for "{search}"</p>
              <button
                onClick={() => setSearch("")}
                className="mt-5 text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-amber-600 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}