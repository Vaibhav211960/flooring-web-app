import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../hooks/useToast";
import { User, Package, LogOut, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";

// ── Validators ──────────────────────────────────────────────────────────────
// Every validator coerces to string first so .trim() never throws on undefined/null
const PROFILE_VALIDATORS = {
  fname: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "First name is required";
    if (s.length < 2) return "Too short (min 2 chars)";
    if (!/^[a-zA-Z\s.'-]+$/.test(s)) return "Letters only";
    return "";
  },
  lname: (v) => {
    const s = String(v ?? "").trim();
    if (s && !/^[a-zA-Z\s.'-]+$/.test(s)) return "Letters only";
    return "";
  },
  contact: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "";                           // optional on profile
    const digits = s.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number";
    return "";
  },
  pincode: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "";                           // optional on profile
    if (!/^\d{6}$/.test(s)) return "Enter a valid 6-digit pincode";
    return "";
  },
  address: (v) => {
    const s = String(v ?? "").trim();
    if (!s) return "";                           // optional on profile
    if (s.length < 10) return "Address too short (min 10 chars)";
    if (s.length > 300) return "Address too long (max 300 chars)";
    return "";
  },
};

const PASSWORD_VALIDATORS = {
  oldPassword: (v) => {
    const s = String(v ?? "").trim();
    return !s ? "Current password is required" : "";
  },
  newPassword: (v) => {
    const s = String(v ?? "");
    if (!s.trim()) return "New password is required";
    if (s.length < 8) return "Must be at least 8 characters";
    if (!/[A-Z]/.test(s)) return "Must include at least one uppercase letter";
    if (!/[0-9]/.test(s)) return "Must include at least one number";
    return "";
  },
  confirmPassword: (v, all) => {
    const s = String(v ?? "");
    if (!s.trim()) return "Please confirm your new password";
    if (s !== (all?.newPassword ?? "")) return "Passwords do not match";
    return "";
  },
};

const validateProfile   = (form) =>
  Object.fromEntries(Object.entries(PROFILE_VALIDATORS).map(([k, fn]) => [k, fn(form[k])]));

const validatePasswords = (form) =>
  Object.fromEntries(Object.entries(PASSWORD_VALIDATORS).map(([k, fn]) => [k, fn(form[k], form)]));

const hasErrors = (errs) => Object.values(errs).some(Boolean);

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOldPass,     setShowOldPass]     = useState(false);
  const [showNewPass,     setShowNewPass]     = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [user, setUser] = useState({
    fname: "", lname: "", userName: "", email: "",
    contact: "", pincode: "", address: "", role: "Customer",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });

  const [profileTouched,  setProfileTouched]  = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});

  const profileErrors  = useMemo(() => validateProfile(user),       [user]);
  const passwordErrors = useMemo(() => validatePasswords(passwords), [passwords]);

  const visibleProfileErrors = Object.fromEntries(
    Object.entries(profileErrors).map(([k, v]) => [k, profileTouched[k] ? v : ""])
  );
  const visiblePasswordErrors = Object.fromEntries(
    Object.entries(passwordErrors).map(([k, v]) => [k, passwordTouched[k] ? v : ""])
  );

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("UserToken")}` },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", getAuthHeaders());
        const data = res.data.user;
        // Coerce every field to a string so validators never receive undefined
        setUser({
          fname:    String(data.fname    ?? ""),
          lname:    String(data.lname    ?? ""),
          userName: String(data.username ?? data.userName ?? ""),
          email:    String(data.email    ?? ""),
          contact:  String(data.contact  ?? ""),
          pincode:  String(data.pincode  ?? ""),
          address:  String(data.address  ?? ""),
          role:     "Customer",
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

  const handleUserField = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "contact") formatted = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") formatted = value.replace(/\D/g, "").slice(0, 6);
    setUser((prev) => ({ ...prev, [name]: formatted }));
    setProfileTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleUserBlur = (e) => {
    setProfileTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handlePasswordField = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handlePasswordBlur = (e) => {
    setPasswordTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileTouched({ fname: true, lname: true, contact: true, pincode: true, address: true });
    if (hasErrors(profileErrors)) {
      toast({ title: "Fix Errors", description: "Please correct the highlighted fields.", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      await axios.put("http://localhost:5000/api/users/me", user, getAuthHeaders());
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch {
      toast({ title: "Update Failed", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordTouched({ oldPassword: true, newPassword: true, confirmPassword: true });
    if (hasErrors(passwordErrors)) {
      toast({ title: "Fix Errors", description: "Please correct the password fields.", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      await axios.put(
        "http://localhost:5000/api/users/me/change-password",
        { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword },
        getAuthHeaders()
      );
      toast({ title: "Password Updated", description: "Your credentials are now secured." });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordTouched({});
    } catch {
      toast({ title: "Incorrect Password", description: "Check your current password.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const p = passwords.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)            score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  }, [passwords.newPassword]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"][passwordStrength];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-4">My Account</p>
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
              <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Personal Details</p>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                  <span className="text-red-400">*</span> Required
                </p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput
                    label="First Name"
                    name="fname"
                    value={user.fname}
                    onChange={handleUserField}
                    onBlur={handleUserBlur}
                    error={visibleProfileErrors.fname}
                    success={profileTouched.fname && !profileErrors.fname}
                    required
                  />
                  <ProfileInput
                    label="Last Name"
                    name="lname"
                    value={user.lname}
                    onChange={handleUserField}
                    onBlur={handleUserBlur}
                    error={visibleProfileErrors.lname}
                    success={profileTouched.lname && !profileErrors.lname && !!user.lname}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileInput
                    label="Contact"
                    name="contact"
                    value={user.contact}
                    onChange={handleUserField}
                    onBlur={handleUserBlur}
                    error={visibleProfileErrors.contact}
                    success={profileTouched.contact && !profileErrors.contact && !!user.contact}
                    placeholder="10-digit mobile (optional)"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <ProfileInput
                    label="Email (Linked)"
                    value={user.email}
                    disabled
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      Shipping Address
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        value={user.address}
                        onChange={handleUserField}
                        onBlur={handleUserBlur}
                        rows="3"
                        maxLength={300}
                        className={`w-full p-4 border rounded-xl text-sm outline-none transition-all resize-none ${
                          visibleProfileErrors.address
                            ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
                            : profileTouched.address && !profileErrors.address && user.address
                            ? "border-emerald-400 ring-2 ring-emerald-50 bg-stone-50"
                            : "border-stone-200 bg-stone-50 focus:border-amber-500"
                        }`}
                        placeholder="Optional — default delivery address"
                      />
                      {user.address && (
                        <span className="absolute bottom-3 right-3 text-[9px] text-stone-400 font-bold">
                          {user.address.length}/300
                        </span>
                      )}
                    </div>
                    {visibleProfileErrors.address ? (
                      <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
                        <span>!</span> {visibleProfileErrors.address}
                      </p>
                    ) : profileTouched.address && !profileErrors.address && user.address ? (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
                        <span>✓</span> Looks good
                      </p>
                    ) : null}
                  </div>
                  <ProfileInput
                    label="Pincode"
                    name="pincode"
                    value={user.pincode}
                    onChange={handleUserField}
                    onBlur={handleUserBlur}
                    error={visibleProfileErrors.pincode}
                    success={profileTouched.pincode && !profileErrors.pincode && !!user.pincode}
                    placeholder="6-digit (optional)"
                    maxLength={6}
                    inputMode="numeric"
                  />
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
              <div className="px-8 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Change Password</p>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                <ProfileInput
                  label="Current Password"
                  name="oldPassword"
                  type={showOldPass ? "text" : "password"}
                  value={passwords.oldPassword}
                  onChange={handlePasswordField}
                  onBlur={handlePasswordBlur}
                  error={visiblePasswordErrors.oldPassword}
                  success={passwordTouched.oldPassword && !passwordErrors.oldPassword}
                  onToggle={() => setShowOldPass(!showOldPass)}
                  showIcon={showOldPass}
                  isPasswordField
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <ProfileInput
                      label="New Password"
                      name="newPassword"
                      type={showNewPass ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={handlePasswordField}
                      onBlur={handlePasswordBlur}
                      error={visiblePasswordErrors.newPassword}
                      success={passwordTouched.newPassword && !passwordErrors.newPassword}
                      onToggle={() => setShowNewPass(!showNewPass)}
                      showIcon={showNewPass}
                      isPasswordField
                      required
                    />
                    {passwords.newPassword && (
                      <div className="space-y-1 pt-1">
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
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${
                          passwordStrength <= 1 ? "text-red-500"
                          : passwordStrength === 2 ? "text-amber-500"
                          : passwordStrength === 3 ? "text-blue-500"
                          : "text-emerald-500"
                        }`}>
                          {strengthLabel} password
                        </p>
                      </div>
                    )}
                  </div>

                  <ProfileInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPass ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={handlePasswordField}
                    onBlur={handlePasswordBlur}
                    error={visiblePasswordErrors.confirmPassword}
                    success={passwordTouched.confirmPassword && !passwordErrors.confirmPassword}
                    onToggle={() => setShowConfirmPass(!showConfirmPass)}
                    showIcon={showConfirmPass}
                    isPasswordField
                    required
                  />
                </div>

                {/* Password rules hint */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Password Requirements</p>
                  {[
                    { rule: passwords.newPassword.length >= 8,           label: "At least 8 characters" },
                    { rule: /[A-Z]/.test(passwords.newPassword),         label: "One uppercase letter" },
                    { rule: /[0-9]/.test(passwords.newPassword),         label: "One number" },
                    { rule: /[^a-zA-Z0-9]/.test(passwords.newPassword),  label: "One special character (recommended)" },
                  ].map(({ rule, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${rule && passwords.newPassword ? "bg-emerald-500" : "bg-stone-300"}`} />
                      <span className={`text-[10px] font-medium ${rule && passwords.newPassword ? "text-emerald-700" : "text-stone-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
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

function ProfileInput({ label, error, success, isPasswordField, onToggle, showIcon, required, ...props }) {
  const borderClass = error
    ? "border-red-400 ring-2 ring-red-50"
    : success
    ? "border-emerald-400 ring-2 ring-emerald-50"
    : "border-stone-200 focus:border-amber-500";

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full h-12 px-4 bg-stone-50 border rounded-xl text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-10 ${borderClass}`}
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
      {error ? (
        <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span>!</span> {error}
        </p>
      ) : success ? (
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span>✓</span> Looks good
        </p>
      ) : null}
    </div>
  );
}