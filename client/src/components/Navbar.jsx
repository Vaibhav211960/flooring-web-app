import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, User, ShoppingCart, LogOut, Package, Settings, Loader2,
} from "lucide-react";
import axios from "axios";
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("UserToken");
  const isLogged = !!token;

  const dashboardRef = useRef(null);
  const userBtnRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) { setUser(null); return; }
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user || response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [token]);

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
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 md:px-10 flex h-18 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center group-hover:bg-amber-700 transition-colors">
            <span className="text-white font-serif font-bold text-lg">I</span>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Inscape Layers
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-amber-700 ${
                location.pathname === link.href ? "text-amber-800" : "text-stone-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 relative">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ShoppingCart className="h-5 w-5 text-stone-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-stone-200 mx-1" />

          {isLogged ? (
            <div className="relative">
              <button
                ref={userBtnRef}
                onClick={() => setDashboard((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 border border-amber-200">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium text-stone-700 max-w-[80px] truncate">
                  {user?.userName || "Account"}
                </span>
              </button>

              {isDashboard && (
                <div
                  ref={dashboardRef}
                  className="absolute top-full right-0 mt-2 w-60 bg-white border border-stone-100 rounded-xl shadow-lg py-2 z-[60]"
                >
                  <div className="px-4 py-3 border-b border-stone-100 mb-1">
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-0.5">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold truncate text-stone-800">
                      {user?.email || "—"}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Profile Settings
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                  >
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  <div className="h-px bg-stone-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-stone-600 text-sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-stone-900 hover:bg-stone-800 text-white px-5 text-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <CartSheet />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-stone-900">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[380px]">
              <div className="flex flex-col gap-8 mt-12">
                {isLogged && user && (
                  <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 border border-amber-200">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{user.userName}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    Navigation
                  </p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={`text-xl font-serif font-medium hover:text-amber-700 transition-colors ${
                        location.pathname === link.href ? "text-amber-800" : "text-stone-900"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-stone-100" />

                <div className="flex flex-col gap-3">
                  {isLogged ? (
                    <>
                      <Link to="/profile" className="text-sm text-stone-600 hover:text-amber-700 transition-colors">
                        Profile Settings
                      </Link>
                      <Link to="/orders" className="text-sm text-stone-600 hover:text-amber-700 transition-colors">
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="mt-2 w-full py-2.5 px-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors text-left"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="outline" className="w-full">Log In</Button>
                      </Link>
                      <Link to="/register">
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white">Sign Up</Button>
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