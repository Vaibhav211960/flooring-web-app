// src/components/CategoryCard.jsx
import React from "react";
import { ArrowRight } from "lucide-react";

export function CategoryCard({ cat }) {
  return (
    <div className="group cursor-pointer flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/70 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent opacity-80 group-hover:opacity-60 transition-opacity z-10" />

        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
          <span className="inline-flex items-center rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            Explore Collection
          </span>

          {cat.startingPricePerSqft && (
            <span className="inline-flex items-center rounded-full bg-amber-100/90 text-amber-900 px-3 py-1 text-[11px] font-medium shadow-sm">
              From ₹{cat.startingPricePerSqft}/sqft
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg md:text-xl font-medium group-hover:text-amber-800 transition-colors">
              {cat.name}
            </h3>

            <p className="text-xs md:text-sm text-stone-600 mt-2 leading-relaxed">
              {cat.description}
            </p>
          </div>

          <ArrowRight className="mt-1 h-5 w-5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Subcategories pills */}
        {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {cat.subcategories.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="inline-flex items-center rounded-full bg-stone-50 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 group-hover:bg-amber-50 group-hover:border-amber-200"
              >
                {sub.name}
              </span>
            ))}
            {cat.subcategories.length > 3 && (
              <span className="text-[10px] text-stone-500">
                +{cat.subcategories.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
