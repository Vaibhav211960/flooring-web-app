import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home as HomeIcon, 
  ChevronRight, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

export default function Profile() {
  const [user, setUser] = useState({
    fname: "Vaibhav",
    lname: "Parmar",
    userName: "vaibhav_01",
    email: "vaibhav@email.com",
    contact: "9876543210",
    pincode: "380015",
    address: "304, Sunrise Residency, Prahladnagar, Ahmedabad",
    role: "Premium Customer",
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      
      <Navbar />

      {/* --- Architectural Header --- */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold tracking-widest">Account Settings</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-3xl font-serif font-bold shadow-xl shadow-amber-900/20">
              {user.fname[0]}{user.lname[0]}
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">
                Hello, <span className="italic text-amber-500">{user.fname}</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] uppercase tracking-[0.15em] bg-stone-800 text-stone-400 px-3 py-1 rounded-full border border-stone-700">
                  {user.role}
                </span>
                <span className="text-stone-500 text-xs font-mono">ID: {user.userName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Dashboard Content --- */}
      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar Nav */}
          <aside className="lg:col-span-3 space-y-2">
            <SidebarLink icon={<User size={18}/>} label="Personal Details" active />
            <SidebarLink icon={<Package size={18}/>} label="Order History" onClick={() => navigate("/order-history")} />
            <SidebarLink icon={<MapPin size={18}/>} label="Saved Addresses" />
            <div className="pt-4 mt-4 border-t border-stone-200">
              <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </aside>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 md:p-10">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-serif font-bold">Identity & Contact</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                  <ShieldCheck size={14} /> Verified Account
                </div>
              </div>

              <form className="space-y-8">
                {/* Names Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="First Name" name="fname" value={user.fname} onChange={handleChange} />
                  <ProfileInput label="Last Name" name="lname" value={user.lname} onChange={handleChange} />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 opacity-60">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 flex items-center gap-2">
                      <Mail size={12}/> Primary Email
                    </label>
                    <input value={user.email} disabled className="w-full h-12 bg-stone-100 border-stone-200 rounded-xl px-4 text-sm cursor-not-allowed" />
                  </div>
                  <ProfileInput label="Contact Number" icon={<Phone size={12}/>} name="contact" value={user.contact} onChange={handleChange} />
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-stone-100 space-y-6">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-stone-400">Default Shipping Address</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Street Address</label>
                    <textarea
                      name="address"
                      rows="3"
                      value={user.address}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none shadow-inner"
                    />
                  </div>
                  <div className="max-w-xs">
                    <ProfileInput label="Pincode" name="pincode" value={user.pincode} onChange={handleChange} />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-end border-t border-stone-100">
                  <button type="button" className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors">
                    Discard Changes
                  </button>
                  <Button className="h-14 px-10 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-stone-200">
                    Update Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

/** --- Sub-Components for Clean Code --- **/

function SidebarLink({ icon, label, active = false }) {
  return (
    <button className={`flex items-center gap-4 w-full px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
      active 
      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
      : "text-stone-500 hover:bg-white hover:text-stone-900"
    }`}>
      {icon}
      {label}
    </button>
  );
}

function ProfileInput({ label, icon, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        {...props}
        className="w-full h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-inner"
      />
    </div>
  );
}