import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Lock, Mail, ChevronRight,
  Home as HomeIcon, UserCircle, Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// FIX: was localStorage.setItem("UserToken", token)
// Now uses setUserToken() from auth utils — unified key "userToken"
import { setUserToken } from "../utils/auth";
import api from "../utils/api";

// ── Validators at module level ────────────────────────────────────────────────
// FIX: was defined inside component — recreated on every render
const validate = (field, value) => {
  if (field === "email") {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
  }
  if (field === "password") {
    if (!value.trim()) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
  }
  return "";
};

export default function Login() {
  const navigate      = useNavigate();
  const [isLoading,     setIsLoading]     = useState(false);
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");

  // useCallback: stable handler
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    const emailError    = validate("email",    email);
    const passwordError = validate("password", password);
    if (emailError || passwordError) {
      const msg = emailError || passwordError;
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/users/login", { email, password });

      // Save token first — THEN fire event — THEN navigate
      // Order matters: token must be in localStorage before Navbar reads it
      setUserToken(res.data.token);

      // Tell Navbar to re-fetch user profile immediately
      // (pathname won't change if user was already on "/" before login)
      window.dispatchEvent(new Event("auth-change"));

      toast.success("Logged in successfully.");
      // Navigate immediately — no setTimeout delay
      // setTimeout was causing a race: navigate unmounted Login before
      // the auth-change event had time to update Navbar state
      navigate("/");
    } catch (err) {
      const status        = err.response?.status;
      const serverMessage = err.response?.data?.message;
      let message = serverMessage || "Invalid credentials. Please try again.";
      if (status === 404) message = "No account found with this email.";
      else if (status === 401) message = "Incorrect password.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Sign In</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">Member Access</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-3">
            Welcome <span className="italic text-amber-400">Back</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
            Sign in to track your orders and manage your account.
          </p>
        </div>
      </section>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-8">
              <div className="p-3 bg-amber-50 rounded-full border border-amber-100">
                <UserCircle className="w-7 h-7 text-amber-700" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full pl-10 pr-4 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full pl-10 pr-12 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end pt-0.5">
                  <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest font-bold text-amber-700 hover:text-amber-800 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
              </button>
            </div>
          </div>

          <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-amber-700 font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}