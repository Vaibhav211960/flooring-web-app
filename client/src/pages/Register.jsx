import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  ChevronRight,
  Home as HomeIcon,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value, data = formData) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (/\d/.test(value)) return "Name cannot contain numbers";
        if (value.length < 2) return "Minimum 2 characters required";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters required";
        return "";
      case "confirmPassword":
        if (value !== data.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [id]: value };
      setErrors((prevErr) => ({
        ...prevErr,
        [id]: validateField(id, value, updated),
      }));
      return updated;
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key], formData);
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link
              to="/"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Register</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            New Member
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-3">
            Create an <span className="italic text-amber-400">Account</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
            Sign up to track orders and manage your profile.
          </p>
        </div>
      </section>

      {/* ── Form ── */}
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-[500px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-8">
              <div className="p-3 bg-amber-50 rounded-full border border-amber-100">
                <UserPlus className="w-7 h-7 text-amber-700" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>

          <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-amber-700 font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}