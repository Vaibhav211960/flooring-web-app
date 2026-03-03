import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye, EyeOff, Lock, Mail, ChevronRight, Home as HomeIcon, UserCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailError = validate("email", email);
    const passwordError = validate("password", password);
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      toast.error(emailError || passwordError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("UserToken", response.data.token);
      toast.success("Logged in successfully.");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      let message = serverMessage || "Invalid credentials. Please try again.";
      if (status === 404) message = "No account found with this email.";
      else if (status === 401) message = "Incorrect password.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold">Sign In</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
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
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-amber-50 rounded-full border border-amber-100">
                <UserCircle className="w-7 h-7 text-amber-700" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="pl-10 pr-12 h-12 bg-stone-50 border-stone-200 rounded-xl"
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
                  <Link
                    to="/forgot-password"
                    className="text-[10px] uppercase tracking-widest font-bold text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-amber-700 font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}