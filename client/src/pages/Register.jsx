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
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../hooks/useToast.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
          return "Invalid email address";
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

      // TRIGGER SUCCESS TOAST
      toast({
        title: "Success!",
        description: "Account created successfully. Redirecting...",
        className: "bg-stone-950 border border-stone-800 text-white rounded-xl shadow-2xl p-6",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong.";
      
      // TRIGGER ERROR TOAST
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
        className: "bg-stone-950 border border-stone-800 text-white rounded-xl shadow-2xl p-6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const InlineError = ({ message }) => {
    if (!message) return null;
    return (
      <div className="bg-red-50 border border-red-100 p-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
        <p className="text-[10px] text-red-600 font-medium">{message}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest uppercase">Join Us</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Create Your <span className="italic text-amber-500">Profile</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            Join our community to save your favorite finishes and track projects.
          </p>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-[500px] bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-amber-50 rounded-full">
                <UserPlus className="w-8 h-8 text-amber-700" />
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl"
                  />
                </div>
                <InlineError message={errors.name} />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl"
                  />
                </div>
                <InlineError message={errors.email} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 bg-stone-50 border-stone-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <InlineError message={errors.password} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Confirm</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 bg-stone-50 border-stone-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <InlineError message={errors.confirmPassword} />
                </div>
              </div>

              <Button
                className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Processing..." : "Create Account"}
              </Button>
            </form>
          </div>

          <div className="bg-stone-50 p-6 border-t border-stone-100 text-center">
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