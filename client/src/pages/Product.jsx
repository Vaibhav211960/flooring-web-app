import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed
import { ProductCard } from "../components/ProductCard";
import {
  ChevronRight,
  Home as HomeIcon,
  Search,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Product() {
  const [product, setProduct] = useState([]); // Default to empty array
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  let pid = "";

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/products");

        // Use a functional check to ensure the data structure is correct
        const data = response.data.products || response.data;

        setProduct(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []); // Keep empty to run only once

  // --- ADD THIS TO SEE YOUR STATE UPDATING ---
  useEffect(() => {
    if (product.length > 0) {
      console.log("State updated! Current product count:", product.length);
    }
  }, [product]);

  // Safely filter (check if product is an array first)
  const filteredProducts = Array.isArray(product)
    ? product.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* --- Elegant Industrial Header --- */}
      <section className="bg-stone-900 text-stone-50 py-12 md:py-20 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-8">
            <Link
              to="/"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">
              Collections
            </span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.4em] mb-4 text-amber-500 font-bold">
              Premium Inventory
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Precision <span className="italic text-amber-500">Flooring</span> Solutions
            </h1>
            <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-xl">
              From Italian marble to engineered oak, explore our curated
              selection of industrial-grade surfaces designed for the modern
              architectural landscape.
            </p>
          </div>
        </div>
      </section>

      {/* --- Consistent Filter & Search Bar --- */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="container max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Search Input Container */}
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by material, finish or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-100 border border-transparent rounded-full py-3 pl-11 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-inner placeholder:text-stone-400"
              />
            </div>

            {/* Stats & Tools */}
            <div className="flex items-center justify-between md:justify-end gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                  Catalog Status
                </span>
                <div className="text-xs text-stone-600 font-medium">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin text-amber-600" /> Synchronizing...
                    </span>
                  ) : (
                    <>
                      Showing <span className="text-stone-900 font-bold">{filteredProducts.length}</span> Solutions
                    </>
                  )}
                </div>
              </div>
              
              <button className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-800 hover:text-amber-700 transition-all border-l border-stone-200 pl-8 h-10 group">
                <SlidersHorizontal className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> 
                <span>Refine</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Product Grid & States --- */}
      <main className="flex-grow container max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-amber-600 animate-spin mb-6" />
            <p className="text-stone-500 text-[10px] tracking-[0.3em] uppercase font-bold">
              Fetching Architectural Materials
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="max-w-md mx-auto text-center py-16 bg-red-50 rounded-3xl border border-red-100 px-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-xl">!</span>
            </div>
            <p className="text-red-900 font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs font-bold uppercase tracking-widest text-red-700 hover:underline"
            >
              Try Reconnecting
            </button>
          </div>
        )}

        {/* Product Grid Success */}
        {!isLoading && !error && (
          <>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                {filteredProducts.map((p) => (
                  <Link
                    key={p._id || p.id}
                    to={`/product/${p._id || p.id}`}
                    className="group transition-all duration-500"
                  >
                    <ProductCard product={p} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border-2 border-dashed border-stone-200 rounded-[2.5rem]">
                <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-stone-300" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  No matches found
                </h3>
                <p className="text-stone-500 text-sm mt-2 max-w-xs mx-auto">
                  We couldn't find any products matching <span className="text-stone-900 font-semibold italic">"{search}"</span>.
                </p>
                <button 
                  onClick={() => setSearch("")}
                  className="mt-8 text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] border-b-2 border-amber-700 hover:text-amber-500 hover:border-amber-500 transition-all pb-1"
                >
                  Reset Catalog
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
