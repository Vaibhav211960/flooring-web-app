import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ChevronRight,
  Home as HomeIcon,
  UserCircle,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useToast } from "../hooks/useToast.jsx";

export default function Login() {
  const navigate = useNavigate();
  // const { login } = useApp(); // Context method to update global user state
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your login details.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
      };
      const response = await axios.post(
        "http://localhost:5000/api/users/login", // Argument 1: URL
        payload, // Argument 2: Data
      );
      console.log(response.data);
      const { token } = response.data;

      localStorage.setItem("token", token);
      console.log(token);
      navigate("/");
    } catch (err) {
      // Handle various error scenarios from the backend
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Header Section */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link
              to="/"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">
              Account
            </span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Welcome <span className="italic text-amber-500">Back</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            Sign in to track your orders, manage your delivery addresses, and
            view your saved collections.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
        <div className="w-full max-w-[450px] bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-amber-50 rounded-full">
                <UserCircle className="w-8 h-8 text-amber-700" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    size="sm"
                    className="text-[10px] text-amber-700 font-bold hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                  <p className="text-[11px] text-red-600 font-medium">
                    {error}
                  </p>
                </div>
              )}

              <Button
                className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-stone-200 transition-all active:scale-[0.98]"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col items-center gap-4 text-center">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                Are you an admin?
              </p>
              <Link
                to="/admin/login"
                className="group flex items-center gap-2 px-6 py-2.5 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all"
              >
                <UserCircle
                  size={14}
                  className="group-hover:text-amber-600 transition-colors"
                />
                Switch to Admin Portal
              </Link>
            </div>
          </div>

          <div className="bg-stone-50 p-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              New here?{" "}
              <Link
                to="/register"
                className="text-amber-700 font-bold hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
