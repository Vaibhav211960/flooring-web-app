import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  User,
  ShoppingCart,
  LogOut,
  Package,
  Settings,
  Loader2,
} from "lucide-react";
import axios from "axios"; // Ensure axios is installed
import { useCart } from "../context/CartContext.jsx";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { CartSheet } from "../components/CartSheet.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboard, setDashboard] = useState(false);
  const [user, setUser] = useState(null); // Real User State
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("UserToken");
  const isLogged = !!token;

  const dashboardRef = useRef(null);
  const userBtnRef = useRef(null);

  // 1. Fetch User Data from Backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      console.log(token);
      
      try {
        setLoading(true);
        // Replace with your actual profile endpoint
        const response = await axios.get(
          "http://localhost:5000/api/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(response.data.user || response.data);
      } catch (err) {
        console.error("Session expired or invalid token");
        // Optional: clear token if it's invalid
        // localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Handle Click Outside for Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dashboardRef.current &&
        !dashboardRef.current.contains(e.target) &&
        !userBtnRef.current?.contains(e.target)
      ) {
        setDashboard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setDashboard(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("UserToken");
    setUser(null);
    setDashboard(false);
    navigate("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Categories" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 flex h-20 items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center group-hover:bg-amber-700 transition-colors">
            <span className="text-white font-serif font-bold text-lg">I</span>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Inscape Layers
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                location.pathname === link.href
                  ? "text-amber-800"
                  : "text-stone-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 relative">
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>

          <div className="h-6 w-px bg-stone-200 mx-2" />

          {isLogged ? (
            <div className="relative">
              <Button
                ref={userBtnRef}
                onClick={() => setDashboard((prev) => !prev)}
                variant="ghost"
                className="flex items-center gap-2 pl-2 pr-2 rounded-full hover:bg-stone-100"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-200">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                {/* Dynamically show name */}
                <span className="text-sm font-medium text-stone-700 max-w-[80px] truncate">
                  {user?.userName || "Profile"}
                </span>
              </Button>

              {isDashboard && (
                <div
                  ref={dashboardRef}
                  className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-100 rounded-xl shadow-xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-4 py-3 border-b border-stone-50 mb-1">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold truncate text-stone-800">
                      {user?.email || "Guest"}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Profile Settings
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>

                  <div className="h-px bg-stone-50 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-stone-600">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-stone-900 hover:bg-stone-800 text-white px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex items-center gap-2">
          <CartSheet />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-stone-900">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {isLogged && user && (
                  <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-stone-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    Navigation
                  </p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-2xl font-serif font-medium text-stone-900 hover:text-amber-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-stone-100" />

                <div className="flex flex-col gap-4">
                  {isLogged ? (
                    <>
                      <Link to="/profile" className="text-lg text-stone-600">
                        My Profile
                      </Link>
                      <Link to="/orders" className="text-lg text-stone-600">
                        My Orders
                      </Link>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="mt-4"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="outline" className="w-full">
                          Log In
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button className="w-full bg-stone-900">
                          Register
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
