import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, Construction } from "lucide-react";
import { Button } from "../ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 text-stone-900 overflow-hidden relative">
      
      {/* Background Decorative Element - Large 404 in Serif */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[25vw] font-serif font-black text-stone-200/40 leading-none">
          404
        </span>
      </div>

      <div className="relative z-10 text-center max-w-lg px-6">
        {/* Architectural Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-900 text-amber-500 mb-8 shadow-2xl shadow-stone-300">
          <Compass size={40} strokeWidth={1.5} className="animate-pulse" />
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Lost in the <span className="italic text-amber-600">Structure?</span>
        </h1>
        
        <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-10 max-w-sm mx-auto">
          The page you are looking for has been moved, archived, or is currently under renovation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button className="h-14 px-8 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition-transform active:scale-95 shadow-lg shadow-stone-200">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Gallery
            </Button>
          </Link>
          
          <Link to="/contact">
            <Button variant="outline" className="h-14 px-8 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px]">
              Support Desk
            </Button>
          </Link>
        </div>

        {/* Technical Footer */}
        <div className="mt-16 flex items-center justify-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
          <Construction size={12} />
          Error Code: ARCH-404-NOTFOUND
        </div>
      </div>
    </div>
  );
}