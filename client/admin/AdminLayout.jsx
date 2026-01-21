import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Sidebar - Fixed or Sticky depends on your Sidebar component */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Usually contains breadcrumbs, user profile, and search */}
        <Topbar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* The Outlet will render the specific admin pages.
               We wrap it in a max-width container to keep the 
               architectural balance consistent with the frontend.
            */}
            <Outlet />
          </div>
        </main>

        {/* Subtle Admin Footer */}
        <footer className="px-10 py-4 border-t border-stone-200 bg-white/50 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
          Inscape Floors Control Studio &copy; 2026 • Internal Access Only
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;