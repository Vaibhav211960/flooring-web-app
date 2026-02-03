import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../hooks/useToast";
import { User, Package, LogOut, Loader2, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // States to toggle visibility for each password field
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [user, setUser] = useState({
    fname: "", lname: "", userName: "", email: "", contact: "", pincode: "", address: "", role: "Customer",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` },
  });

  const darkToastStyles = "bg-stone-900 text-stone-50 border border-stone-800 font-serif shadow-2xl";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", getAuthHeaders());
        const data = res.data.user;
        setUser({
          fname: data.fname || "",
          lname: data.lname || "",
          userName: data.username || data.userName || "",
          email: data.email || "",
          contact: data.contact || "",
          pincode: data.pincode || "",
          address: data.address || "",
          role: "Customer",
        });
      } catch {
        toast({ title: "EXPIRED", description: "Please login again.", variant: "destructive", className: darkToastStyles });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me", user, getAuthHeaders());
      toast({ title: "PROFILE UPDATED", description: "Your information is now synced.", className: `${darkToastStyles} border-l-4 border-l-amber-600` });
    } catch {
      toast({ title: "UPDATE FAILED", description: "Something went wrong.", variant: "destructive", className: darkToastStyles });
    } finally { setUpdating(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      }, getAuthHeaders());
      toast({ title: "PASSWORD SECURED", description: "Credential update successful.", className: `${darkToastStyles} border-l-4 border-l-amber-600` });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast({ title: "DENIED", description: "Check your current password.", variant: "destructive", className: darkToastStyles });
    } finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-amber-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <section className="bg-stone-900 text-stone-50 py-12">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-amber-600 flex items-center justify-center text-3xl font-bold shadow-xl shadow-amber-900/20">
             <User className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-serif font-bold italic tracking-tight">welcome , {user.userName}</h1>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
           <aside className="lg:col-span-3 space-y-4">
             <SidebarLink icon={<User size={18} />} label="Personal Details" active />
             <SidebarLink icon={<Package size={18} />} label="My Orders" onClick={() => navigate("/order-history")} />
             <button onClick={() => { localStorage.removeItem("UserToken"); navigate("/login"); }} className="flex items-center gap-4 w-full px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl uppercase tracking-widest">
               <LogOut size={18} /> Sign Out
             </button>
           </aside>

           <div className="lg:col-span-9 space-y-10">
              {/* Profile Details Card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileInput label="First Name" name="fname" value={user.fname} onChange={(e) => setUser({...user, fname: e.target.value})} />
                      <ProfileInput label="Last Name" name="lname" value={user.lname} onChange={(e) => setUser({...user, lname: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileInput label="Contact" name="contact" value={user.contact} onChange={(e) => setUser({...user, contact: e.target.value})} />
                      <ProfileInput label="Email (Linked)" value={user.email} disabled />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-stone-500 ml-1">Shipping Address</label>
                        <textarea name="address" value={user.address} onChange={(e) => setUser({...user, address: e.target.value})} rows="3" className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all" />
                      </div>
                      <ProfileInput label="Pincode" name="pincode" value={user.pincode} onChange={(e) => setUser({...user, pincode: e.target.value})} />
                   </div>
                   <div className="flex justify-end pt-4">
                      <Button disabled={updating} className="bg-stone-900 text-white px-10 h-12 uppercase tracking-widest font-bold">
                        {updating ? "Syncing..." : "Update Profile"}
                      </Button>
                   </div>
                </form>
              </div>

              {/* Section Divider */}
              <div className="items-center px-6 py-3 border border-slate-200 text-slate-600 rounded-lg shadow-sm bg-white font-medium uppercase tracking-wide text-sm">
                Change Password
              </div>

              {/* Password section */}
              <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                   <ProfileInput 
                    label="Current Password" 
                    type={showOldPass ? "text" : "password"} 
                    value={passwords.oldPassword} 
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    onToggle={() => setShowOldPass(!showOldPass)}
                    showIcon={showOldPass}
                    isPasswordField
                   />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileInput 
                        label="New Password" 
                        type={showNewPass ? "text" : "password"} 
                        value={passwords.newPassword} 
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        onToggle={() => setShowNewPass(!showNewPass)}
                        showIcon={showNewPass}
                        isPasswordField
                      />
                      <ProfileInput 
                        label="Confirm Password" 
                        type={showConfirmPass ? "text" : "password"} 
                        value={passwords.confirmPassword} 
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        onToggle={() => setShowConfirmPass(!showConfirmPass)}
                        showIcon={showConfirmPass}
                        isPasswordField
                      />
                   </div>
                   <div className="flex justify-end pt-4">
                      <Button disabled={updating} className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 uppercase tracking-widest font-bold">
                        Update Password
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

function SidebarLink({ icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${active ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-stone-500 hover:bg-white hover:text-stone-900"}`}>
      {icon} {label}
    </button>
  );
}

// Updated ProfileInput to handle Eye Toggle
function ProfileInput({ label, error, isPasswordField, onToggle, showIcon, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-stone-500 ml-1 tracking-tight">{label}</label>
      <div className="relative">
        <input 
          {...props} 
          className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all disabled:opacity-50 pr-10" 
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors"
          >
            {showIcon ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}