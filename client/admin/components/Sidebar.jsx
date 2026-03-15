import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Layers,
  ReceiptText,
  Users,
  CreditCard,
  MessageSquare,
  Warehouse,
  BarChart2,   // Reports icon
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-300";
  const activeClass   = "bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20";
  const inactiveClass = "text-stone-400 hover:text-white hover:bg-stone-800";

  // FIX: renamed from LogOut → handleLogout
  // OLD: `const LogOut = () => {...}` overwrote the LogOut icon imported above
  // This meant the icon variable was gone and the lucide icon would throw an error
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login"); // useNavigate instead of window.location for smoother SPA transition
  };

  return (
    <aside className="w-64 min-h-screen bg-stone-900 text-white flex flex-col border-r border-stone-800">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-stone-800 flex items-center gap-3">
        <div className="h-8 w-full bg-amber-500 text-stone-900 flex items-center justify-center font-serif text-lg font-bold rounded-lg">
          Menu
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2 mt-4">
        <SidebarLink to="/admin"              end  icon={<LayoutDashboard size={18} />} label="Dashboard"      base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/products"          icon={<Box size={18} />}             label="Products"       base={baseClass} active={activeClass} inactive={inactiveClass} />
        {/* Inventory sits right below Products — it manages product stock */}
        <SidebarLink to="/admin/inventory"         icon={<Warehouse size={18} />}       label="Inventory"      base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/categories"        icon={<Layers size={18} />}          label="Categories"     base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/subcategories"     icon={<Layers size={18} />}          label="Sub-Categories" base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/orders"            icon={<ReceiptText size={18} />}     label="Orders"         base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/customers"         icon={<Users size={18} />}           label="Customers"      base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/payments"          icon={<CreditCard size={18} />}      label="Payments"       base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/feedback"          icon={<MessageSquare size={18} />}   label="Feedback"       base={baseClass} active={activeClass} inactive={inactiveClass} />
        <SidebarLink to="/admin/reports"           icon={<BarChart2 size={18} />}        label="Reports"        base={baseClass} active={activeClass} inactive={inactiveClass} />
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-stone-800/50">
        {/* FIX: removed `fixed bottom-4` positioning — it caused the button to float
            outside the sidebar and overlap page content on scroll */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-fit px-4 py-3 text-[11px] uppercase tracking-widest font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={16} /> Exit
        </button>
      </div>
    </aside>
  );
};

function SidebarLink({ to, icon, label, base, active, inactive, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
    >
      {icon} {label}
    </NavLink>
  );
}

export default Sidebar;