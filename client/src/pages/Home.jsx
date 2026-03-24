import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Truck, Award, PenTool, ShieldCheck, Star, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { CategoryCard } from "../components/CategoryCard.jsx";
import { FeatureBox } from "../ui/featureBox.jsx";
import { Button } from "../ui/button.jsx";
import heroImage from "../assets/elegant_living_room_with_hardwood_flooring.png";
import api from "../utils/api";

const REVIEWS = [
  {
    id: 1,
    name: "Emily R.",
    rating: 5,
    text: "Inscape transformed our home! The quality is unmatched and the process was seamless. Highly recommend for anyone looking to upgrade their flooring.",
  },
  {
    id: 2,
    name: "Michael S.",
    rating: 4,
    text: "Great value for the price. The flooring looks fantastic and has held up well with our kids and pets. Customer service was responsive when we had questions.",
  },
  {
    id: 3,
    name: "Sophia L.",
    rating: 5,
    text: "I was blown away by the durability and beauty of the floors. They have a real premium feel without the premium price. Will definitely be using Inscape for future projects!",
  },
];

export default function Home() {
  // FIX: categories now fetched from API, not hardcoded mock data
  const [categories,   setCategories]   = useState([]);
  const [isCatLoading, setIsCatLoading] = useState(true);

  // useCallback: stable reference — won't be recreated on every render
  const fetchCategories = useCallback(async () => {
    try {
      setIsCatLoading(true);
      // Fetch subcategories to show as collections (same as CategoryPage)
      const res = await api.get("/subcategories");
      setCategories(res.data.subCategories || []);
    } catch {
      // Silent fail — homepage still renders, just without live categories
    } finally {
      setIsCatLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const scrollToCategories = (e) => {
    e.preventDefault();
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* HERO */}
      <section className="relative h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/40 to-stone-900/60 z-10" />
        <img
          src={heroImage}
          alt="Modern living room with hardwood flooring"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="relative z-20 text-center text-white max-w-4xl px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400 mb-4">
            Premium Flooring Direct
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg leading-tight">
            Flooring Built for <br />
            <span className="text-amber-300 italic">Generations</span>
          </h1>
          <p className="text-base md:text-lg mb-10 text-stone-300 max-w-2xl mx-auto leading-relaxed font-light">
            Direct-from-manufacturer pricing on premium hardwood, vinyl, and laminate.
            Elevate your home with timeless durability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToCategories}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white border-none text-sm font-bold uppercase tracking-widest px-8 h-14 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Explore Collections
            </Button>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white text-white hover:text-stone-900 text-sm font-bold uppercase tracking-widest px-8 h-14 rounded-xl transition-all"
              >
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES — now from API */}
      <section id="categories" className="py-16 md:py-24 bg-stone-50">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-700 mb-2">Our Catalog</p>
              <h2 className="font-serif text-4xl font-semibold text-stone-900">Browse by Category</h2>
            </div>
            <Link
              to="/categories"
              className="group flex items-center gap-2 text-stone-500 hover:text-amber-700 transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              View All Categories
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isCatLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
              <span className="text-stone-400 text-sm italic tracking-widest">Loading collections...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show first 3 — same as before but now from real API */}
              {categories.slice(0, 3).map((cat) => (
                <Link
                  key={cat._id || cat.id}
                  to={`/category/subcategory/${cat._id || cat.id}`}
                  className="transform transition-all duration-300 hover:-translate-y-1"
                >
                  <CategoryCard cat={cat} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 md:py-24 bg-stone-900 text-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">Our Promise</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Why Choose Inscape</h2>
            <div className="h-px w-12 bg-amber-600 mx-auto mb-5" />
            <p className="text-stone-400 max-w-xl mx-auto text-sm leading-relaxed">
              We cut out the middlemen to bring you industrial-grade durability with showroom aesthetics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureBox icon={Award}       title="Premium Materials"    description="Sourced directly from top manufacturers to ensure lasting quality." />
            <FeatureBox icon={ShieldCheck} title="Transparent Pricing"  description="Direct-to-consumer pricing without compromising on quality." />
            <FeatureBox icon={PenTool}     title="Design Support"       description="Expert guidance from concept to completion." />
            <FeatureBox icon={Truck}       title="Fast Delivery"        description="Reliable shipping with secure packaging." />
          </div>
        </div>
      </section>

      {/* REVIEWS — still from mockData (these are testimonials, not product reviews) */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-700 mb-2">Customer Reviews</p>
            <h2 className="font-serif text-3xl font-semibold text-stone-900">Trusted by Homeowners</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-stone-600 mb-6 text-sm leading-relaxed italic">"{review.text}"</p>
                </div>
                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="font-semibold text-stone-900 text-sm">{review.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-amber-600 text-white text-center">
        <div className="container max-w-3xl mx-auto px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-100 mb-4">Start Your Project</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-amber-100 mb-10 text-sm leading-relaxed max-w-md mx-auto">
            Get a custom quote or order samples to see the quality for yourself.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold uppercase tracking-widest px-10 h-14 rounded-xl border-none transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Start Your Project
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}