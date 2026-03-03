import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../hooks/useToast";
import { User, Package, LogOut, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
        toast({ title: "Session Expired", description: "Please login again.", variant: "destructive" });
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
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch {
      toast({ title: "Update Failed", description: "Something went wrong.", variant: "destructive" });
    } finally { setUpdating(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Passwords Don't Match", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      }, getAuthHeaders());
      toast({ title: "Password Updated", description: "Your credentials are now secured." });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast({ title: "Incorrect Password", description: "Check your current password.", variant: "destructive" });
    } finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero — same dark hero pattern */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-4">
            My Account
          </p>
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-amber-600 flex items-center justify-center shadow-xl shadow-amber-900/20 shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
                {user.fname ? `${user.fname} ${user.lname}` : user.userName}
              </h1>
              <p className="text-stone-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-2 space-y-1">
                <SidebarLink icon={<User size={16} />} label="Personal Details" active />
                <SidebarLink icon={<Package size={16} />} label="My Orders" onClick={() => navigate("/order-history")} />
              </div>
              <div className="border-t border-stone-100 p-2">
                <button
                  onClick={() => { localStorage.removeItem("UserToken"); navigate("/login"); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-xl uppercase tracking-widest transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">

            {/* Profile Details */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-stone-100 flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Personal Details</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="First Name" name="fname" value={user.fname} onChange={(e) => setUser({ ...user, fname: e.target.value })} />
                  <ProfileInput label="Last Name" name="lname" value={user.lname} onChange={(e) => setUser({ ...user, lname: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput label="Contact" name="contact" value={user.contact} onChange={(e) => setUser({ ...user, contact: e.target.value })} />
                  <ProfileInput label="Email (Linked)" value={user.email} disabled />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Shipping Address</label>
                    <textarea
                      name="address"
                      value={user.address}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                      rows="3"
                      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <ProfileInput label="Pincode" name="pincode" value={user.pincode} onChange={(e) => setUser({ ...user, pincode: e.target.value })} />
                </div>
                <div className="flex justify-end pt-2 border-t border-stone-100">
                  <Button
                    disabled={updating}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-10 h-12 rounded-xl uppercase tracking-widest font-bold text-[11px] transition-all"
                  >
                    {updating ? "Saving..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-stone-100 flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Change Password</p>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                <ProfileInput
                  label="Current Password"
                  type={showOldPass ? "text" : "password"}
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  onToggle={() => setShowOldPass(!showOldPass)}
                  showIcon={showOldPass}
                  isPasswordField
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput
                    label="New Password"
                    type={showNewPass ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    onToggle={() => setShowNewPass(!showNewPass)}
                    showIcon={showNewPass}
                    isPasswordField
                  />
                  <ProfileInput
                    label="Confirm Password"
                    type={showConfirmPass ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    onToggle={() => setShowConfirmPass(!showConfirmPass)}
                    showIcon={showConfirmPass}
                    isPasswordField
                  />
                </div>
                <div className="flex justify-end pt-2 border-t border-stone-100">
                  <Button
                    disabled={updating}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-10 h-12 rounded-xl uppercase tracking-widest font-bold text-[11px] transition-all"
                  >
                    {updating ? "Saving..." : "Update Password"}
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
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${
        active
          ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
          : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ProfileInput({ label, error, isPasswordField, onToggle, showIcon, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{label}</label>
      <div className="relative">
        <input
          {...props}
          className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10"
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 transition-colors"
          >
            {showIcon ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">! {error}</p>}
    </div>
  );
}