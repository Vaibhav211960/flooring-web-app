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

        {/* Categories Grid */}
        <section className="py-16 md:py-24">
          <div className="container max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="font-serif text-3xl font-bold text-stone-900">All Collections</h2>
               <div className="h-px flex-1 bg-stone-200" />
               <span className="text-xs font-mono text-stone-400">
                {subcategories.length} Categories
               </span>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <p className="text-stone-500 font-medium">Loading collections...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 text-amber-700 underline font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Data Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {subcategories.map((sub) => (
                  <div 
                    key={sub._id || sub.id} 
                    /* Redirects to CategoryProduct.jsx via the /category/:catId route */
                    onClick={() => navigate(`/category/subcategory/${sub._id || sub.id}`)} 
                    className="block h-full transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <CategoryCard cat={sub} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}