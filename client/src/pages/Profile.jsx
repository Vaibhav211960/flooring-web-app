import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  Home as HomeIcon, ChevronRight, User, MapPin, 
  Phone, Mail, Package, LogOut, ShieldCheck, Loader2, KeyRound
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [user, setUser] = useState({
    fname: "", lname: "", userName: "", email: "",
    contact: "", pincode: "", address: "", role: "Customer"
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: ""
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

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
          role: "Customer"
        });
      } catch (err) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me", user, getAuthHeaders());
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) return toast.error("Please fill password fields");
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("New passwords do not match");

    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, getAuthHeaders());
      toast.success("Password changed successfully");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-amber-600" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 py-12">
        <div className="container max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-amber-600 flex items-center justify-center text-3xl font-bold shadow-xl shadow-amber-900/20">
            {user.fname?.[0]}{user.lname?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold italic tracking-tight">
              Architectural <span className="text-amber-500 not-italic">Identity</span>
            </h1>
            <p className="text-stone-400 text-sm font-mono mt-1 uppercase tracking-tighter">Member ID: {user.userName}</p>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <aside className="lg:col-span-3 space-y-4">
            <SidebarLink icon={<User size={18}/>} label="Personal Details" active />
            <SidebarLink icon={<Package size={18}/>} label="My Orders" onClick={() => navigate("/order-history")} />
            <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} 
              className="flex items-center gap-4 w-full px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest">
              <LogOut size={18} /> Sign Out
            </button>
          </aside>

          <div className="lg:col-span-9 space-y-10">
            {/* --- Profile Form --- */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3">
                <span className="h-8 w-1 bg-amber-500 block"></span> Identity & Contact
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="First Name" name="fname" value={user.fname} onChange={handleChange} />
                  <ProfileInput label="Last Name" name="lname" value={user.lname} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="Contact" name="contact" value={user.contact} onChange={handleChange} />
                  <ProfileInput label="Email (Linked)" name="email" value={user.email} readOnly disabled />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-500 ml-1">Shipping Address</label>
                  <textarea name="address" value={user.address} onChange={handleChange}
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all" rows="3" />
                </div>
                <div className="flex justify-end"><Button type="submit" disabled={updating} className="bg-stone-900 text-white px-10 h-12 uppercase tracking-widest font-bold">Update Profile</Button></div>
              </form>
            </div>

            {/* --- Password Change Form --- */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-3">
                <span className="h-8 w-1 bg-stone-900 block"></span> Security Credentials
              </h2>
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <ProfileInput label="Current Password" type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="New Password" type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} />
                  <ProfileInput label="Confirm New Password" type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={updating} className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 uppercase tracking-widest font-bold">Update Security</Button>
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
    <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${
      active ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-stone-500 hover:bg-white hover:text-stone-900"
    }`}>
      {icon} {label}
    </button>
  );
}

function ProfileInput({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-stone-500 ml-1 tracking-tight">{label}</label>
      <input {...props} className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all disabled:opacity-50" />
    </div>
  );
}