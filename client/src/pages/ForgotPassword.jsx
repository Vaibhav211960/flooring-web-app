import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
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
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Recovery</span>
          </nav>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
            Secure Access
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            Account{" "}
            <span className="italic text-amber-400">Recovery</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-sm mx-auto mt-4 leading-relaxed">
            We'll send a secure link to reset your password.
          </p>
        </div>
      </section>

      {/* ── Form Card ── */}
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-[450px] bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

          <div className="p-8 md:p-10">
            {!isSubmitted ? (
              <>
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                    Reset Access Key
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Enter the email associated with your account and we'll send
                    a secure link to reset your password.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-10 pr-4 h-12 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight mt-1">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send Recovery Link
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* ── Success State ── */
              <div className="py-4 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Email Sent
                  </h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    If an account exists for{" "}
                    <span className="font-bold text-stone-900">{email}</span>,
                    you will receive a password reset link shortly.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="block w-full h-12 border border-stone-200 rounded-xl font-bold uppercase tracking-widest text-[11px] text-stone-600 hover:bg-stone-50 transition-all flex items-center justify-center"
                >
                  Return to Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] text-stone-500 font-bold hover:text-amber-700 transition-colors uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}