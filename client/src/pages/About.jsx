import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Ruler, Gem, Users, Home as HomeIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import aboutImage from "../assets/office-vinyl-flooring.jpg";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 overflow-hidden relative border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
              Our Philosophy
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              Flooring crafted for{" "}
              <span className="italic text-amber-400 underline decoration-stone-700 underline-offset-8">
                timeless
              </span>{" "}
              interiors.
            </h1>
            <p className="text-sm md:text-lg text-stone-400 max-w-2xl leading-relaxed font-light">
              At Inscape Floors, we believe the right flooring is more than a surface.
              It's the silent foundation of every memory made at home — from quiet
              mornings with coffee to evenings with family.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </section>

      {/* ── Story + Image ── */}
      <section className="py-20 md:py-32">
        <div className="container max-w-7xl mx-auto px-6 grid gap-16 lg:grid-cols-2 items-center">
          {/* Story */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-block border-l-2 border-amber-500 pl-6">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
                Our Story
              </h2>
            </div>

            <div className="space-y-6 text-stone-600 leading-relaxed text-sm md:text-base">
              <p>
                Inscape Floors was founded with a simple vision: to make
                high-quality, beautifully designed flooring accessible to modern
                homes without the overwhelming complexity of traditional showrooms.
              </p>
              <p>
                Over the years, we've partnered with trusted manufacturers and
                experienced craftsmen to bring together collections that balance
                aesthetic warmth, durability, and everyday practicality.
              </p>
              <p className="font-medium text-stone-900 italic border-l-2 border-amber-200 pl-4">
                "From minimalist apartments to luxury residences, we ensure each
                space feels intentional, welcoming, and uniquely personal."
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-amber-200 pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-amber-200 pointer-events-none" />
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-stone-200">
              <img
                src={aboutImage}
                alt="Inscape Floors work showcase"
                className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Values (Dark Section) ── */}
      <section className="py-20 md:py-32 bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
              Core Principles
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              What guides our{" "}
              <span className="italic text-amber-400">craft</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <ValueCard
              icon={<Gem className="h-6 w-6" />}
              title="Quality First"
              desc="We carefully select materials that combine industrial strength, artisanal finish, and long-term resilience."
            />
            <ValueCard
              icon={<Ruler className="h-6 w-6" />}
              title="Thoughtful Design"
              desc="Every recommendation balances aesthetics and layout to match the geometry of how you truly live."
            />
            <ValueCard
              icon={<Users className="h-6 w-6" />}
              title="People-Centered"
              desc="From first blueprint to final installation, we are committed to clear communication and expert support."
            />
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-700 mb-3">
            Our Promise
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-stone-900 leading-tight">
            Built on trust,{" "}
            <span className="italic text-amber-600">detail, and craft.</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12 text-sm md:text-base">
            Whether you're renovating a single room or designing an entire home,
            our team is here to help you make decisions with confidence and clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-100 flex items-center"
            >
              Consult an Expert
            </Link>
            <Link
              to="/products"
              className="h-12 px-8 border border-stone-200 text-stone-900 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-100 transition-all flex items-center"
            >
              View Catalog
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="group p-8 rounded-2xl border border-stone-800 bg-stone-800/50 hover:bg-amber-500 transition-all duration-500">
      <div className="h-12 w-12 rounded-xl bg-stone-900 text-amber-500 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-amber-600 transition-colors">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-bold mb-4 group-hover:text-stone-900 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-stone-400 leading-relaxed group-hover:text-stone-800 transition-colors">
        {desc}
      </p>
    </div>
  );
}