import React, { useState } from "react";
import { Lock, Mail, ArrowRight, UserCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = { email: email, password: password };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        payload,
      );

      // If successful
      localStorage.setItem("token", res.data.token);
      console.log("Admin Login Token:", res.data.token);
      
      alert("Welcome back to the Studio Registry.");
      navigate("/admin");
    } catch (err) {
      // 1. Alert the admin about invalid credentials
      // We check if it's a 401 (Unauthorized) or 400 (Bad Request)
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 400)
      ) {
        alert("Authentication Failed: Invalid email or security key.");
      } else {
        alert("System Error: Could not connect to the authentication server.");
      }

      // 2. Clear the password field state
      setPassword("");

      console.error("Login attempt failed:", err.message);
    }
  };
  return (
    <div className="min-h-screen w-full flex bg-stone-50">
      {/* --- Left Side: Aesthetic Visual --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070"
          alt="Inscape Studio Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%]"
        />
        <div className="relative z-10 m-auto p-12 text-center">
          <h1 className="font-serif text-5xl text-white font-bold tracking-tight mb-4">
            Inscape Layers
          </h1>
          <div className="h-px w-24 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-stone-300 italic font-medium tracking-wide uppercase text-[10px]">
            The Architect's Command Center
          </p>
        </div>
        <div className="absolute bottom-10 left-10 text-white/40 text-[10px] uppercase tracking-[0.3em]">
          &copy; 2024 Inscape layers Registry
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Admin Access
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-2">
                  <Mail size={12} className="text-amber-600" /> Corporate Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-900 transition-all shadow-sm"
                  placeholder="admin@inscapelayers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-2">
                  <Lock size={12} className="text-amber-600" /> password
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-stone-900 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl shadow-stone-200"
            >
              Log in <ArrowRight size={14} />
            </button>
          </form>

          {/* Redirector for Customers */}
          <div className="pt-8 border-t border-stone-200 flex flex-col items-center gap-4">
            <p className="text-xs text-stone-400 font-medium">
              Not a studio administrator?
            </p>
            <a
              href="/login"
              className="group flex items-center gap-2 px-6 py-2 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-100 transition-all"
            >
              <UserCircle size={14} className="group-hover:text-amber-600" />
              Switch to Customer Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
