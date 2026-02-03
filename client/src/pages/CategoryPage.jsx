import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { ChevronRight, Home as HomeIcon, Loader2 } from "lucide-react";
import { CategoryCard } from "../components/CategoryCard.jsx";

export default function CategoryPage() {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
const [searchQuery, setSearchQuery] = useState("");
  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint for subcategories
        const response = await axios.get("http://localhost:5000/api/subcategories");
        setSubcategories(response.data.subCategories);
        // console.log(subcategories);
        // console.log(response);
        
        
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to load collections. Please try again later.");
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
        {/* Dark Hero Section */}
        <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
          <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
            <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-8">
              <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <HomeIcon className="h-3 w-3" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-amber-500 font-bold">Collections</span>
            </nav>

            <div className="max-w-3xl">
              <p className="text-[10px] uppercase tracking-[0.4em] mb-4 text-amber-500 font-bold">
                Industrial Catalog
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Architectural <span className="italic">Surfaces</span>
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-2xl">
                Explore our specialized categories. Each collection is engineered for 
                specific environmental demands.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid & Search Section */}
        <section className="py-16 md:py-24">
          <div className="container max-w-7xl mx-auto px-6">
            
            {/* Search and Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4 flex-1">
                <h2 className="font-serif text-3xl font-bold text-stone-900 whitespace-nowrap">
                  All Collections
                </h2>
                <div className="h-px flex-1 bg-stone-200 hidden sm:block" />
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-5 pr-12 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm placeholder:text-stone-400"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <span className="hidden lg:block text-[10px] font-mono text-stone-400 uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full">
                  {filteredSubcategories.length} Items
                </span>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-500 font-medium tracking-wide">Refining results...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Data Grid */}
            {!isLoading && !error && (
              <>
                {filteredSubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredSubcategories.map((sub) => (
                      <div 
                        key={sub._id || sub.id} 
                        onClick={() => navigate(`/category/subcategory/${sub._id || sub.id}`)} 
                        className="group block h-full transition-all duration-300 active:scale-[0.98] cursor-pointer"
                      >
                        <CategoryCard cat={sub} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 border-2 border-dashed border-stone-200 rounded-3xl">
                    <div className="bg-stone-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                       </svg>
                    </div>
                    <h3 className="text-stone-900 font-serif text-xl font-bold">No collections found</h3>
                    <p className="text-stone-500 text-sm mt-2">We couldn't find any results matching "{searchQuery}"</p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="mt-6 text-amber-700 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-amber-600 transition-colors"
                    >
                      Clear Filter
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