import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ChevronLeft, ArrowRight, ShieldCheck, Home as HomeIcon, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Header - Matching Login Style */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest uppercase">Recovery</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Account <span className="italic text-amber-500">Recovery</span>
          </h1>
        </div>
      </section>

      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-[450px] bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden transition-all">
          <div className="p-8 md:p-10">
            
            {!isSubmitted ? (
              <>
                <div className="mb-8 space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-stone-900">Reset Access Key</h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Enter the email associated with your account and we'll send a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Registered Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                      <Input
                        type="email"
                        required
                        placeholder="yourname@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-stone-200 transition-all flex items-center justify-center gap-2 group" 
                    disabled={isLoading} 
                    type="submit"
                  >
                    {isLoading ? "Processing..." : (
                      <>
                        Send Recovery Link <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              /* Success State */
              <div className="py-4 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-stone-900">Email Sent</h2>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    If an account exists for <span className="font-bold text-stone-900">{email}</span>, you will receive a password reset link shortly.
                  </p>
                </div>
                <Button 
                   asChild
                   variant="outline"
                   className="w-full h-12 border-stone-200 rounded-xl font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50"
                >
                   <Link to="/login">Return to Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-6 border-t border-stone-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs text-stone-500 font-bold hover:text-amber-700 transition-colors uppercase tracking-widest">
              <ChevronLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}