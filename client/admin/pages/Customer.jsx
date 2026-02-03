import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner"; // Ensure <Toaster /> is in your App.js or main.jsx
import { 
  Users, Trash2, Mail, Phone, Calendar, 
  Search, ShieldCheck, Loader2, UserMinus 
} from "lucide-react";

export default function CustomerAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null); // Track which user is being deleted
  
  const token = localStorage.getItem("adminToken"); // Ensure this matches your login key

  // Custom Dark Style for Sonner
  const toastStyle = {
    background: "#1c1917", // stone-900
    color: "#fafaf9",      // stone-50
    border: "1px solid #444",
    fontFamily: "serif"
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/getAllUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Registry Access Denied", { style: toastStyle });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    if (!window.confirm("Permanently remove this user from the directory?")) return;
    
    setProcessingId(userId); // UI Feedback: Show loader on the specific row
    
    try {
      // NOTE: Fixed the axios.put structure. Headers must be the 3rd argument for PUT
      await axios.put(`http://localhost:5000/api/users/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Identity Revoked", {
        description: "User has been removed from the registry.",
        style: toastStyle
      });

      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error("Operation Failed", {
        description: err.response?.data?.message || "Check admin permissions.",
        style: toastStyle
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
      <Loader2 className="animate-spin text-amber-600 h-10 w-10" />
      <p className="mt-4 font-serif text-stone-500 italic">Accessing User Registry...</p>
    </div>
  );

  return (
    <div className="p-8 bg-stone-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">User Directory</h1>
          <p className="text-stone-500 text-sm mt-1 uppercase tracking-widest font-mono">
            Total Records: {users.length}
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search identity..."
            className="pl-12 pr-6 py-3 bg-white border border-stone-200 rounded-2xl w-full md:w-80 text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-900 text-stone-50 text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-8 py-5">Identity</th>
              <th className="px-8 py-5">Communication</th>
              <th className="px-8 py-5">Access Level</th>
              <th className="px-8 py-5">Enrolled</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center font-bold border border-stone-200 uppercase">
                      {user.fname?.[0]}{user.lname?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{user.fname} {user.lname}</p>
                      <p className="text-[10px] text-stone-400 font-mono">#{user._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Mail size={12} className="text-stone-400" /> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Phone size={12} className="text-stone-400" /> {user.contact || "N/A"}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-xs text-stone-500 font-mono">
                  {new Date(user.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => deleteUser(user._id)}
                    disabled={processingId === user._id}
                    className="p-2 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {processingId === user._id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <Users className="mx-auto h-12 w-12 text-stone-200 mb-4" />
            <p className="font-serif italic text-stone-400">No matching records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}