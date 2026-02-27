import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Users, Trash2, Mail, Phone, Search, Loader2,
} from "lucide-react";

export default function CustomerAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem("adminToken");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/getAllUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = (userId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Remove this user permanently?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setProcessingId(userId);
                try {
                  await axios.put(
                    `http://localhost:5000/api/users/${userId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setUsers((prev) => prev.filter((u) => u._id !== userId));
                  toast.success("User removed.");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Delete failed.");
                } finally {
                  setProcessingId(null);
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-amber-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Customers</h1>
          <p className="text-stone-500 text-sm mt-1 font-medium italic">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-11 pr-6 py-3 bg-white border border-stone-200 rounded-xl w-full md:w-80 text-sm focus:border-amber-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">User</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Contact</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Role</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Joined</th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-stone-50/50 transition-colors group">
                {/* User */}
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center font-bold border border-stone-200 uppercase text-xs shrink-0">
                      {user.fname?.[0]}{user.lname?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">
                        {user.fname} {user.lname}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        #{user._id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <Mail size={11} className="text-stone-400" /> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Phone size={11} className="text-stone-400" /> {user.contact || "—"}
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-amber-50 border-amber-200 text-amber-700">
                    {user.role || "customer"}
                  </span>
                </td>

                {/* Joined */}
                <td className="p-5 text-xs text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="p-5 text-right">
                  <button
                    onClick={() => deleteUser(user._id)}
                    disabled={processingId === user._id}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                    title="Delete user"
                  >
                    {processingId === user._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-stone-200 mb-3" />
            <p className="italic text-stone-400 text-sm">
              {searchTerm ? "No users match your search." : "No users registered yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}