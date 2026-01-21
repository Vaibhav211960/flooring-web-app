import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Home as HomeIcon, SlidersHorizontal, LayoutGrid, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ProductCard } from "../components/ProductCard";

export default function CategoryProducts() {
  // We use catId because that is what you defined in App.jsx: /category/:catId
  const { catId } = useParams(); 
  
  const [products, setProducts] = useState([]);
  const [subcategory, setSubcategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Subcategory details (to get the Title/Description)
        // 2. Fetch Products filtered by this subcategory ID
        const [subRes, prodRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/subcategories/${catId}`),
          axios.get(`http://localhost:5000/api/products/subcategory/${catId}`)
        ]);

        setSubcategory(subRes.data.subCategories);
        setProducts(prodRes.data.products);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load products for this collection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (catId) fetchCategoryData();
  }, [catId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className="text-stone-500 font-medium tracking-widest uppercase text-[10px]">Loading Collection...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      {/* --- Collection Hero Section --- */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-20">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <Link to="/categories" className="hover:text-white transition-colors">
              Collections
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500 font-bold uppercase">
              {subcategory?.title || "Series"}
            </span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.4em] mb-4 text-amber-500 font-bold">
                Series Catalog
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight capitalize">
                {subcategory?.title || "Architectural Series"}
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed">
                {subcategory?.description || "Explore our high-performance range of architectural solutions tailored for modern design."}
              </p>
            </div>
            
            <div className="hidden md:flex justify-end">
              <div className="bg-stone-800/50 backdrop-blur-md border border-stone-700 p-6 rounded-2xl flex gap-8">
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Total Variants</span>
                  <span className="text-2xl font-mono text-white font-bold">{products.length}</span>
                </div>
                <div className="w-px bg-stone-700 h-full" />
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-stone-500 mb-1">Standard Grade</span>
                  <span className="text-2xl font-mono text-amber-500 font-bold">AAA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Filter & View Toolbar --- */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500">
            <LayoutGrid className="h-4 w-4" />
            Displaying {products.length} Products
          </div>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-700 hover:text-amber-700 transition-colors">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* --- Product Grid --- */}
      <main className="flex-grow py-12 md:py-20">
        <div className="container max-w-7xl mx-auto px-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-stone-300">
              <h3 className="font-serif text-2xl text-stone-400">No products found in this series.</h3>
              <Link to="/categories" className="mt-4 inline-block text-amber-700 font-bold text-xs uppercase tracking-widest hover:underline">
                Return to all collections
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}