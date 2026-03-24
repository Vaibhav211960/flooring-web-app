import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home as HomeIcon, Loader2, Search } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { CategoryCard } from "../components/CategoryCard.jsx";
import api from "../utils/api";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");

  // useCallback: stable fetch reference
  // FIX: was plain async in useEffect — retry button called window.location.reload()
  // NEW: retry just calls fetchSubcategories() — no page reload, no state loss
  const fetchSubcategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get("/subcategories");
      setSubcategories(res.data.subCategories || []);
    } catch {
      setError("Failed to load collections. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubcategories(); }, [fetchSubcategories]);

  // useMemo: filter only recomputes when subcategories or searchQuery changes
  // OLD: plain .filter() in render body — ran on every render
  const filteredSubcategories = useMemo(() => {
    const s = searchQuery.toLowerCase();
    if (!s) return subcategories;
    return subcategories.filter((sub) =>
      sub.name?.toLowerCase().includes(s) ||
      sub.description?.toLowerCase().includes(s)
    );
  }, [subcategories, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
          <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
              <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <HomeIcon className="h-3 w-3" /> Home
              </Link>
              <ChevronRight className="h-3 w-3 text-stone-700" />
              <span className="text-amber-500">Collections</span>
            </nav>
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">Our Catalog</p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
                Flooring <span className="italic text-amber-400">Collections</span>
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Browse our range of flooring categories, each suited for different styles and spaces.
              </p>
            </div>
          </div>
        </section>

        {/* Sticky search */}
        <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
          <div className="container max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100 border border-transparent rounded-xl py-3 pl-11 pr-4 text-sm focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-stone-400"
              />
            </div>
            {!isLoading && (
              <span className="text-xs text-stone-400 font-medium">
                <span className="text-stone-900 font-bold">{filteredSubcategories.length}</span> collections
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        <section className="py-12 md:py-16">
          <div className="container max-w-7xl mx-auto px-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-400 text-sm italic tracking-widest">Loading collections...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium text-sm mb-4">{error}</p>
                {/* FIX: was window.location.reload() — now calls fetchSubcategories() */}
                <button
                  onClick={fetchSubcategories}
                  className="px-6 h-10 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !error && (
              filteredSubcategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubcategories.map((sub) => (
                    <div
                      key={sub._id || sub.id}
                      onClick={() => navigate(`/category/subcategory/${sub._id || sub.id}`)}
                      className="group block h-full transition-all duration-300 active:scale-[0.98] cursor-pointer hover:-translate-y-1"
                    >
                      <CategoryCard cat={sub} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 border-2 border-dashed border-stone-200 rounded-2xl">
                  <div className="bg-stone-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-stone-400" />
                  </div>
                  <h3 className="text-stone-900 font-serif text-lg font-bold mb-2">No results found</h3>
                  <p className="text-stone-500 text-sm">No collections match "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-5 text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-amber-600 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}