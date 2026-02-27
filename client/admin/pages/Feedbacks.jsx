import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Star, 
  Mail, 
  Trash2, 
  CheckCircle, 
  MessageSquare, 
  Calendar, 
  User, 
  Filter,
  MoreHorizontal,
  Loader2
} from "lucide-react";

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/feedback/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.feedbacks || [];
      setFeedbacks(data);

      // Calculate average rating
      if (data.length > 0) {
        const avg = data.reduce((sum, fb) => sum + fb.rating, 0) / data.length;
        setAvgRating(avg.toFixed(1));
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/feedback/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Customer Voice</h1>
          <p className="text-sm text-stone-500 mt-1 italic">Monitoring satisfaction and service quality benchmarks.</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl flex items-center gap-2">
            <Star className="text-amber-500" size={16} fill="currentColor" />
            <span className="text-sm font-bold text-stone-900">{avgRating} Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Reviews</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{feedbacks.length}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">5 Star Reviews</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{feedbacks.filter(f => f.rating === 5).length}</p>
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-4">
        {feedbacks.map((fb) => (
          <div
            key={fb._id}
            className="bg-white border border-stone-200 rounded-2xl hover:border-amber-200 transition-all duration-300 p-6 group"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              {/* User Info & Rating */}
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-stone-900">
                      {fb.userId?.userName || "Anonymous"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 mt-1">
                    <Mail size={12} />
                    <span className="text-xs">{fb.userId?.email || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Stars & Date */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < fb.rating ? "text-amber-500" : "text-stone-200"}
                      fill={i < fb.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-stone-400 mt-2">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase">
                    {new Date(fb.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Product name */}
            {fb.productId?.name && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mt-4">
                Product: {fb.productId.name}
              </p>
            )}

            {/* Message Content */}
            <div className="mt-4 bg-stone-50 rounded-2xl p-5 relative">
              <MessageSquare size={16} className="text-stone-200 absolute top-4 right-4" />
              <p className="text-sm text-stone-600 leading-relaxed italic">"{fb.comment}"</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-50">
              <button
                onClick={() => deleteFeedback(fb._id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase hover:bg-red-600 hover:text-white transition-all border border-red-100"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
            <div className="bg-stone-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-stone-300" size={30} />
            </div>
            <h3 className="text-stone-900 font-bold">No Feedback Yet</h3>
            <p className="text-sm text-stone-500 mt-1">Your inbox is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;