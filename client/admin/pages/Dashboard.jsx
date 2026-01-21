import React from "react";
import StatCard from "../components/StatCard";
import { Box, ReceiptText, Users, Banknote, Calendar, ArrowUpRight } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-10">
      {/* --- Dashboard Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Executive Overview</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Monitoring Inscape Floors' commercial performance.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
          <Calendar size={14} className="text-amber-600" />
          Jan 01 — Jan 18, 2026
        </button>
      </div>

      {/* --- Statistics Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value="120" 
          icon={<Box />} 
          trend="up"
          trendValue="4% new"
        />
        <StatCard 
          title="Active Orders" 
          value="350" 
          icon={<ReceiptText />} 
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard 
          title="Total Customers" 
          value="89" 
          icon={<Users />} 
          trend="up"
          trendValue="+2"
        />
        <StatCard
          title="Gross Revenue"
          value="₹1,25,000"
          icon={<Banknote />}
          trend="down"
          trendValue="3.1%"
        />
      </div>

      {/* --- Secondary Row (Charts/Quick Actions Placeholder) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden group">
          <div className="absolute top-6 left-8">
            <h3 className="font-serif text-lg font-bold">Revenue Analytics</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Performance Visualization</p>
          </div>
          <p className="text-stone-300 font-serif italic">Chart visualization placeholder...</p>
          <div className="absolute bottom-6 right-8">
             <button className="text-amber-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
               View Full Report <ArrowUpRight size={14}/>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;