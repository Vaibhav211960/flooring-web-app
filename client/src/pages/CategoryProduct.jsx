// src/pages/CategoryProducts.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Home as HomeIcon, ChevronRight, Filter } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ProductCard, products } from "../components/ProductCard"; // Use your central products data

export default function CategoryProducts() {
  // const { catId } = useParams();

  // // Filter products by subCategoryId
  // const filteredProducts = products.filter(
  //   (p) => p.subCategoryId === catId
  // );

  // return (
  //   <div className="min-h-screen flex flex-col bg-stone-50">
  //     <Navbar />

  //     {/* Header - Consistent with CategoryPage */}
  //     <section className="bg-stone-900 text-white">
  //       <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16">
  //         <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
  //           <Link to="/" className="hover:text-white flex items-center gap-1">
  //             <HomeIcon className="h-3 w-3" /> Home
  //           </Link>
  //           <ChevronRight className="h-3 w-3" />
  //           <Link to="/categories" className="hover:text-white">Collections</Link>
  //           <ChevronRight className="h-3 w-3" />
  //           <span className="text-amber-500 font-bold capitalize">{catId.replace(/-/g, ' ')}</span>
  //         </nav>

  //         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
  //           <div>
  //             <h1 className="font-serif text-4xl md:text-5xl font-bold capitalize mb-2">
  //               {catId.replace(/-/g, ' ')}
  //             </h1>
  //             <p className="text-stone-400 text-sm max-w-xl italic">
  //               A specialized selection of premium {catId.replace(/-/g, ' ')} solutions.
  //             </p>
  //           </div>
            
  //           <div className="flex items-center gap-6 border-t md:border-t-0 border-stone-800 pt-6 md:pt-0">
  //              <div className="text-right">
  //                 <span className="block text-[10px] uppercase tracking-widest text-stone-500">Available Items</span>
  //                 <span className="text-xl font-mono text-amber-500 font-bold">{filteredProducts.length}</span>
  //              </div>
  //              <button className="bg-stone-800 p-3 rounded-md hover:bg-stone-700 transition-colors">
  //                 <Filter className="h-4 w-4 text-stone-300" />
  //              </button>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Product Display */}
  //     <section className="flex-grow py-16 md:py-24">
  //       <div className="container max-w-7xl mx-auto px-6">
  //         {filteredProducts.length === 0 ? (
  //           <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-2xl">
  //             <p className="text-stone-400 font-medium font-serif text-lg">
  //               No products currently listed in this collection.
  //             </p>
  //             <Link to="/categories" className="text-amber-700 text-xs font-bold uppercase tracking-widest mt-4 inline-block hover:underline">
  //               Back to all categories
  //             </Link>
  //           </div>
  //         ) : (
  //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
  //             {filteredProducts.map((product) => (
  //               <ProductCard key={product._id} product={product} />
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     </section>

    //   <Footer />
    // </div>
  // );
}