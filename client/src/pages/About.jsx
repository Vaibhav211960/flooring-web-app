import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Ruler, Gem, Users, Award, ShieldCheck, Target } from "lucide-react";
import aboutImage from "../assets/office-vinyl-flooring.jpg"; 

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* --- Hero Section --- */}
      <section className="bg-stone-900 text-stone-50 overflow-hidden relative border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-amber-500 font-bold mb-4">
              Our Philosophy
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-[1.1]">
              Flooring crafted for <br />
              <span className="italic text-amber-500 underline decoration-stone-700 underline-offset-8">timeless</span> interiors.
            </h1>
            <p className="text-sm md:text-lg text-stone-400 max-w-2xl leading-relaxed font-light">
              At Inscape Floors, we believe the right flooring is more than a
              surface. It's the silent foundation of every memory made at home — from
              quiet mornings with coffee to evenings with family.
            </p>
          </div>
        </div>
        {/* Subtle background texture or element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </section>

      {/* --- Story + Image --- */}
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
                homes without the overwhelming complexity of traditional
                showrooms.
              </p>
              <p>
                Over the years, we&apos;ve partnered with trusted manufacturers and
                experienced craftsmen to bring together collections that balance
                aesthetic warmth, durability, and everyday practicality.
              </p>
              <p className="font-medium text-stone-900 italic">
                "From minimalist apartments to luxury residences, we ensure each
                space feels intentional, welcoming, and uniquely personal."
              </p>
            </div>
          </div>

          {/* Image with architectural framing */}
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

      {/* --- Values --- */}
      <section className="py-20 md:py-32 bg-stone-900 text-stone-50">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-[10px] tracking-[0.3em] uppercase text-amber-500 font-bold mb-4">
              Core Principles
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              What guides our craft
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

      {/* --- Closing CTA --- */}
      <section className="py-24 md:py-32 relative">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-stone-900 leading-tight">
            Built on trust, <br />
            <span className="italic text-amber-600">detail, and craft.</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Whether you're renovating a single room or designing an entire
            home, our team is here to help you make decisions with confidence
            and clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="h-14 px-10 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-all shadow-lg shadow-stone-200">
              Consult an Expert
            </button>
            <button className="h-14 px-10 border border-stone-200 text-stone-900 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-100 transition-all">
              View Catalog
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** --- Sub-Components --- **/

function StatItem({ number, label }) {
  return (
    <div className="text-center space-y-1">
      <p className="font-serif text-2xl md:text-3xl font-bold text-stone-900">{number}</p>
      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{label}</p>
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="group p-8 rounded-2xl border border-stone-800 bg-stone-800/50 hover:bg-amber-500 transition-all duration-500">
      <div className="h-12 w-12 rounded-xl bg-stone-900 text-amber-500 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-amber-500 transition-colors">
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