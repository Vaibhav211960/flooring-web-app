import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Mail, Lock, UserPlus, ChevronRight,
  Home as HomeIcon, Eye, EyeOff, Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });

  // ── Validators ────────────────────────────────────────────────────────────
  const validateField = (name, value, data = formData) => {
    const s = String(value ?? "");
    switch (name) {
      case "name":
        if (!s.trim()) return "Name is required";
        if (/\d/.test(s)) return "Name cannot contain numbers";
        if (s.trim().length < 2) return "Minimum 2 characters required";
        return "";
      case "email":
        if (!s.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Enter a valid email address";
        return "";
      case "password":
        if (!s) return "Password is required";
        if (s.length < 8) return "Minimum 8 characters required";
        if (!/[A-Z]/.test(s)) return "Must include at least one uppercase letter";
        if (!/[0-9]/.test(s)) return "Must include at least one number";
        return "";
      case "confirmPassword":
        if (!s) return "Please confirm your password";
        if (s !== (data.password ?? "")) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  // Derive all errors live — never stale
  const allErrors = useMemo(() => ({
    name:            validateField("name",            formData.name),
    email:           validateField("email",           formData.email),
    password:        validateField("password",        formData.password),
    confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
  }), [formData]);

  // Only show errors for touched fields
  const visibleErrors = Object.fromEntries(
    Object.entries(allErrors).map(([k, v]) => [k, touched[k] ? v : ""])
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.id]: true }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Touch all fields to reveal every error
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.values(allErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/signup", {
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
      });
      toast.success("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)            score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  }, [formData.password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][passwordStrength];
  const strengthText  = ["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"][passwordStrength];

  // ── Dynamic field border ──────────────────────────────────────────────────
  const fieldCls = (key, extra = "") => [
    "w-full h-12 bg-stone-50 border rounded-xl text-sm outline-none transition-all",
    extra,
    touched[key] && allErrors[key]
      ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
      : touched[key] && !allErrors[key]
      ? "border-emerald-400 ring-2 ring-emerald-50"
      : "border-stone-200 focus:border-amber-500",
  ].join(" ");

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Register</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">New Member</p>
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
        <div className="w-full max-w-[520px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
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
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your name"
                    className={fieldCls("name", "pl-10 pr-4")}
                  />
                </div>
                <FieldMsg touched={touched.name} error={visibleErrors.name} hasValue={!!formData.name} />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@example.com"
                    className={fieldCls("email", "pl-10 pr-4")}
                  />
                </div>
                <FieldMsg touched={touched.email} error={visibleErrors.email} hasValue={!!formData.email} />
              </div>

              {/* Password + Confirm side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldCls("password", "pl-10 pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-amber-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldMsg touched={touched.password} error={visibleErrors.password} hasValue={!!formData.password} />

                  {/* Strength meter — shown as soon as user starts typing */}
                  {formData.password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength ? strengthColor : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${strengthText}`}>
                        {strengthLabel} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                    Confirm <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldCls("confirmPassword", "pl-10 pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-amber-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldMsg touched={touched.confirmPassword} error={visibleErrors.confirmPassword} hasValue={!!formData.confirmPassword} />
                </div>
              </div>

              {/* Password requirements checklist */}
              {formData.password && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Password Requirements
                  </p>
                  {[
                    { rule: formData.password.length >= 8,            label: "At least 8 characters" },
                    { rule: /[A-Z]/.test(formData.password),          label: "One uppercase letter" },
                    { rule: /[0-9]/.test(formData.password),          label: "One number" },
                    { rule: /[^a-zA-Z0-9]/.test(formData.password),   label: "One special character (recommended)" },
                  ].map(({ rule, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${rule ? "bg-emerald-500" : "bg-stone-300"}`} />
                      <span className={`text-[10px] font-medium transition-colors ${rule ? "text-emerald-700" : "text-stone-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
              </button>
            </div>
          </div>

          <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-700 font-bold hover:underline">
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

// ── Inline field feedback ─────────────────────────────────────────────────────
function FieldMsg({ touched, error, hasValue }) {
  if (!touched) return null;
  if (error) return (
    <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
      <span>!</span> {error}
    </p>
  );
  if (hasValue) return (
    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
      <span>✓</span> Looks good
    </p>
  );
  return null;
}