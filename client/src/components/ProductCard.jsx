import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Ruler, Info, ArrowRight } from "lucide-react";
import AddToCartBtn from "../components/AddToCartBtn.jsx";

const ProductCard = ({ product }) => {
  return (
    <div className="group cursor-pointer flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/70 overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${product._id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 z-10" />

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Status Badges - Matching your CategoryCard style */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            <span className="inline-flex items-center rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
              ₹{product.price} / sqft
            </span>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium shadow-sm backdrop-blur-md ${
                product.stock > 5
                  ? "bg-emerald-100/90 text-emerald-900"
                  : "bg-amber-100/90 text-amber-900"
              }`}
            >
              {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
            </span>
          </div>
        </div>

        {/* Content - Matching CategoryCard Padding and Typography */}
        <div className="flex flex-col flex-grow gap-3 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-serif text-lg font-medium group-hover:text-amber-800 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-2">
                {product.description}
              </p>
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Action Button - Integrated into the card flow */}
          <div className="mt-auto pt-2">
           
              <AddToCartBtn product={product} className="h-10 w-60 text-sm" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export { ProductCard };
