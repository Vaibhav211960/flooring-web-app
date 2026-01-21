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
  MoreHorizontal
} from "lucide-react";

const feedbackData = [
  {
    id: "FDB-001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    message: "The flooring quality is excellent. The natural grain of the wood is exactly what we wanted for our living room. Delivery was on time.",
    rating: 5,
    status: "new",
    createdAt: "Dec 18, 2024",
  },
  {
    id: "FDB-002",
    name: "Anjali Patel",
    email: "anjali@gmail.com",
    message: "Good product but packaging could be improved. One of the boxes was slightly torn, though the material inside was safe.",
    rating: 4,
    status: "new",
    createdAt: "Dec 17, 2024",
  },
  {
    id: "FDB-003",
    name: "Amit Verma",
    email: "amit@gmail.com",
    message: "Order arrived two days late. I had to reschedule my carpenters. Not satisfied with the logistics service.",
    rating: 2,
    status: "resolved",
    createdAt: "Dec 15, 2024",
  },
  {
    id: "FDB-004",
    name: "Sanya Malhotra",
    email: "sanya@design.com",
    message: "As an interior designer, I highly recommend their Teak collection. Pure class and very easy to install.",
    rating: 5,
    status: "new",
    createdAt: "Dec 19, 2024",
  },
  {
    id: "FDB-005",
    name: "Vikram Sethi",
    email: "vikram@sethi.in",
    message: "Average experience. The color looks a bit darker than the website photos.",
    rating: 3,
    status: "resolved",
    createdAt: "Dec 12, 2024",
  }
];

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState(feedbackData);

  /* --- BACKEND INTEGRATION (COMMENTED OUT) ---
  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Error fetching feedback", err);
    }
  };

  const updateFeedbackStatus = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`http://localhost:5000/api/feedback/${id}`, 
        { status: "resolved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // fetchFeedbacks();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  useEffect(() => {
    // fetchFeedbacks();
  }, []);
  ------------------------------------------- */

  const markResolved = (id) => {
    setFeedbacks(
      feedbacks.map((fb) =>
        fb.id === id ? { ...fb, status: "resolved" } : fb
      )
    );
  };

  const deleteFeedback = (id) => {
    if (window.confirm("Delete this feedback permanently?")) {
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
    }
  };

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
                <span className="text-sm font-bold text-stone-900">4.8 Avg Rating</span>
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
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Pending Response</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{feedbacks.filter(f => f.status === 'new').length}</p>
        </div>
        
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-4">
        {feedbacks.map((fb) => (
          <div
            key={fb.id}
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
                    <h3 className="font-bold text-stone-900">{fb.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter border ${
                        fb.status === 'new' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                        {fb.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 mt-1">
                    <Mail size={12} />
                    <span className="text-xs">{fb.email}</span>
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
                    <span className="text-[10px] font-bold uppercase">{fb.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="mt-6 bg-stone-50 rounded-2xl p-5 relative">
              <MessageSquare size={16} className="text-stone-200 absolute top-4 right-4" />
              <p className="text-sm text-stone-600 leading-relaxed italic">"{fb.message}"</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-50">
              {fb.status === "new" && (
                <button
                  onClick={() => markResolved(fb.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                >
                  <CheckCircle size={14} /> Mark as Resolved
                </button>
              )}
            
            </div>
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center">
            <div className="bg-stone-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-stone-300" size={30} />
            </div>
            <h3 className="text-stone-900 font-bold">No New Feedback</h3>
            <p className="text-sm text-stone-500 mt-1">Your inbox is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;