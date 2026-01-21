import { Link } from "react-router-dom";
import {
  Truck,
  Award,
  PenTool,
  ShieldCheck,
  Star,
  Search,
  ArrowRight,
} from "lucide-react";

import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { CategoryCard } from "../components/CategoryCard.jsx";
import { CATEGORIES, REVIEWS } from "../libs/mockData.js";
import { FeatureBox } from "../ui/featureBox.jsx";
import { Button } from "../ui/button.jsx";
import heroImage from "../assets/elegant_living_room_with_hardwood_flooring.png";

export default function Home() {
  // Smooth scroll handler
  const scrollToCategories = (e) => {
    e.preventDefault();
    const element = document.getElementById("categories");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sansselect-none selection:bg-transparent"
    >
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Darker overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/40 to-stone-900/60 z-10" />

        <img
          src={heroImage}
          alt="Modern living room with hardwood flooring"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager" // Important for Hero LCP
        />

        <div className="relative z-20 text-center text-white max-w-4xl px-6 animate-in fade-in zoom-in duration-700">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg leading-tight">
            Flooring Built for <br />
            <span className="text-amber-100/90 italic">Generations</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 text-stone-200 max-w-2xl mx-auto leading-relaxed font-light">
            Direct-from-manufacturer pricing on premium hardwood, vinyl, and
            laminate. Elevate your home with timeless durability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
            <Button
              onClick={scrollToCategories}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white border-none text-lg px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
            >
              Explore Collections
            </Button>

            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/40 hover:bg-white text-white hover:text-stone-900 text-lg px-8 py-4 h rounded-full transition-all"
              >
                Get a qoute
              </Button>
            </Link>
          </div>
        </div>

      </section>

      {/* --- CATEGORIES --- */}
      <section id="categories" className="pt-32 pb-24 bg-stone-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-700 mb-2">
                Our Catalog
              </p>
              <h2 className="font-serif text-4xl font-semibold text-stone-900">
                Browse by Category
              </h2>
            </div>
            <Link
              to="/categories"
              className="group flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors font-medium"
            >
              View Full Inventory{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                to={`/categories`}
                className="transform transition-all duration-300 hover:-translate-y-1"
              >
                <CategoryCard cat={cat} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- VALUE PROPOSITION (Why Inscape) --- */}
      <section className="py-24 bg-amber-50/50 border-y border-amber-100">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-stone-900">
              Crafted for Timeless Interiors
            </h2>
            <div className="h-1 w-12 bg-amber-600 mx-auto rounded-full mb-6" />
            <p className="text-stone-600 max-w-2xl mx-auto text-lg">
              We cut out the middlemen to bring you industrial-grade durability
              with showroom aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureBox
              icon={Award}
              title="Premium Materials"
              description="Sourced directly from top manufacturers to ensure lasting quality."
            />
            <FeatureBox
              icon={ShieldCheck}
              title="Transparent Pricing"
              description="Direct-to-consumer pricing without compromising on quality."
            />
            <FeatureBox
              icon={PenTool}
              title="Design Support"
              description="Expert guidance from concept to completion."
            />
            <FeatureBox
              icon={Truck}
              title="Fast Delivery"
              description="Reliable shipping timelines and secure packaging."
            />
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-stone-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-semibold mb-4">
              Trusted by Homeowners
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-500 text-amber-500"
                      />
                    ))}
                  </div>
                  <p className="text-stone-600 mb-6 text-sm leading-relaxed italic">
                    “{review.text}”
                  </p>
                </div>
                <div className="font-semibold text-stone-900 border-t border-stone-100 pt-4 flex items-center justify-between">
                  {review.name}
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-normal">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA / FOOTER PREVIEW --- */}
      <section className="py-20 bg-stone-900 text-white text-center">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="text-stone-400 mb-8">
            Get a custom quote or order samples to see the quality for yourself.
          </p>
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-white text-stone-900 hover:bg-stone-200 px-8 py-4 rounded-full"
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
