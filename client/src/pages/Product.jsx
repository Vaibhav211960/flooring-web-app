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
      <section className="bg-stone-900 text-stone-50 py-12 md:py-20">
        <div className="container max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link
              to="/"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-stone-200 font-bold">Collections</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Precision <span className="text-amber-500 italic">Flooring</span>{" "}
              Solutions
            </h1>
            <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-xl">
              From Italian marble to engineered oak, explore our curated
              selection of industrial-grade surfaces designed for the modern
              architectural landscape.
            </p>
          </div>
        </div>
      </section>

      {/* --- Filter & Search Bar --- */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by material, finish or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Stats & Tools */}
            <div className="flex items-center justify-between md:justify-end gap-6">
              <div className="text-xs text-stone-500 font-medium uppercase tracking-widest">
                {isLoading ? (
                  "Fetching data..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-stone-900 font-bold">
                      {filteredProducts.length}
                    </span>{" "}
                    Results
                  </>
                )}
              </div>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-700 hover:text-amber-700 transition-colors border-l border-stone-200 pl-6">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Product Grid & States --- */}
      <main className="flex-grow container max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-4" />
            <p className="text-stone-500 text-sm tracking-widest uppercase font-bold">
              Synchronizing Catalog...
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Success */}
        {!isLoading && !error && (
          <>
            {/* {console.log("Rendering products, count:", filteredProducts[1]._id)} */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((p) => (
                  /* Wrap the card in a Link tag */
                  <>
                    <Link
                      key={p._id}
                      className="transition-transform duration-300 hover:-translate-y-2"
                    >
                      <ProductCard product={p} />
                    </Link>
                  </>
                ))}
              </div>
            ) : (
              <>
                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
                  <Search className="mx-auto h-8 w-8 text-stone-300 mb-3" />
                  <h3 className="text-lg font-bold text-stone-900">
                    No matching products found
                  </h3>
                  <p className="text-stone-500 text-sm mt-1">
                    Try a different search term
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
