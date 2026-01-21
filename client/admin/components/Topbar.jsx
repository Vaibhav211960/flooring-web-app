import { Bell, Search, UserCircle, Settings } from "lucide-react";

const Topbar = () => {
  return (
    <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Left: Search Bar to fill space professionally */}
     <div className="p-8 border-stone-800/50">
        <h1 className="font-serif text-xl font-bold tracking-tight">
          INSCAPE <span className="italic text-amber-500 text-sm">Layers</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500 mt-1 font-bold">
          Admin Control Center
        </p>
      </div>

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