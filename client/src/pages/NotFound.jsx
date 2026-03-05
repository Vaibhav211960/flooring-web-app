import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, Construction, Home as HomeIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <div className="flex-grow flex items-center justify-center overflow-hidden relative">
        {/* Background 404 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[22vw] font-serif font-black text-stone-200/50 leading-none">
            404
          </span>
        </div>

        <div className="relative z-10 text-center max-w-lg px-6 py-24">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-900 text-amber-500 mb-8 shadow-2xl shadow-stone-300/50">
            <Compass size={40} strokeWidth={1.5} className="animate-pulse" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-700 mb-3">
            Error 404
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Lost in the{" "}
            <span className="italic text-amber-600">Structure?</span>
          </h1>

          <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-10 max-w-sm mx-auto">
            The page you are looking for has been moved, archived, or is
            currently under renovation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 h-12 px-8 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-lg shadow-stone-200"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Gallery
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 h-12 px-8 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all"
            >
              Support Desk
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
            <Construction size={12} />
            Error Code: ARCH-404-NOTFOUND
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}