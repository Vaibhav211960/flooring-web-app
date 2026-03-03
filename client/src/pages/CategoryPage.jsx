import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { ChevronRight, Home as HomeIcon, Loader2, Search } from "lucide-react";
import { CategoryCard } from "../components/CategoryCard.jsx";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/subcategories");
        setSubcategories(response.data.subCategories);
      } catch (err) {
        setError("Failed to load collections. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubcategories();
  }, []);

  const filteredSubcategories = subcategories.filter((sub) =>
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
          <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-8">
              <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <HomeIcon className="h-3 w-3" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-amber-500 font-bold">Collections</span>
            </nav>

            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] mb-3 text-amber-500 font-bold">
                Our Catalog
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
                Flooring <span className="italic">Collections</span>
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Browse our range of flooring categories, each suited for different
                styles and spaces.
              </p>
            </div>
          </div>
        </section>

        {/* Grid Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-7xl mx-auto px-6">

            {/* Header + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="font-serif text-3xl font-bold text-stone-900 whitespace-nowrap">
                  All Collections
                </h2>
                <div className="h-px flex-1 bg-stone-200 hidden sm:block" />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-stone-400"
                  />
                </div>
                {!isLoading && (
                  <span className="hidden lg:block text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                    {filteredSubcategories.length} items
                  </span>
                )}
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-400 text-sm italic">Loading collections...</p>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Grid */}
            {!isLoading && !error && (
              <>
                {filteredSubcategories.length > 0 ? (
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
                    <h3 className="text-stone-900 font-serif text-lg font-bold">No results found</h3>
                    <p className="text-stone-500 text-sm mt-2">
                      No collections match "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-5 text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-amber-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}