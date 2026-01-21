import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed
import { User, Mail, Lock, UserPlus, ChevronRight, Home as HomeIcon } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }
      // --- BACKEND INTEGRATION ---
      // Replace URL with your actual backend signup endpoint
      const response = await axios.post("http://localhost:5000/api/users/signup", payload);
      console.log("Registration successful:", response.data);

      // Success Notification
      toast({
        title: "Welcome to the Inscape Layers!",
        description: "Registration successful. You can now sign in to your account.",
      });

      // Redirect to Login page so they can authenticate
      navigate("/login");

    } catch (error) {
      // Handle specific error messages from your backend (e.g., "Email already exists")
      const errorMessage = error.response?.data?.message || "Something went wrong during registration.";
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Industrial Header */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12 md:py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">Join Us</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Create Your <span className="italic text-amber-500">Profile</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-lg mx-auto leading-relaxed">
            Join our community to save your favorite finishes, track project orders, and receive architectural updates.
          </p>
        </div>
      </section>

      {/* Registration Interface */}
      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-[500px] bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-amber-50 rounded-full">
                <UserPlus className="w-8 h-8 text-amber-700" />
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500" htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500" htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Password Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500" htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500" htmlFor="confirmPassword">Confirm</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 h-12 bg-stone-50 border-stone-200 rounded-xl focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-none"
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-stone-200 transition-all active:scale-[0.98] mt-4" 
                disabled={isLoading} 
                type="submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Create Account"
                )}
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