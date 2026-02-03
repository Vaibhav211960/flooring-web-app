import { Bell, Search, UserCircle, Settings } from "lucide-react";

const Topbar = () => {
  return (
    <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Left: Search Bar to fill space professionally */}
    <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center group-hover:bg-amber-700 transition-colors">
            <span className="text-white font-serif font-bold text-lg">I</span>
          </div>
          <span className="font-serif text-xl pr-245 font-bold tracking-tight text-stone-900">
            Inscape Layers
          </span>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
       

        <div className="h-8 w-[1px] bg-stone-200 mx-2 relative"></div>

        {/* Admin Profile */}
        <div className="absolute right-10 flex align-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-stone-900 uppercase tracking-widest leading-none">Inscape Admin</p>
            <p className="text-[10px] text-stone-400 font-medium mt-1 italic">Master Access</p>
          </div>
          
          <div className="h-10 w-10 rounded-xl bg-stone-900 text-amber-500 flex items-center justify-center font-serif text-lg font-bold border-2 border-amber-500/20 shadow-inner">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;