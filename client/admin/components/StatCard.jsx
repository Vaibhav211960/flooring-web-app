import React from "react";

const StatCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 hover:border-amber-200 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        {/* Left: Content */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
              {title}
            </p>
            <h3 className="text-3xl font-serif font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
              {value}
            </h3>
          </div>

          {/* Trend Indicator (Optional Subtitle Replacement) */}
          {(trendValue || trend) && (
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                vs last month
              </span>
            </div>
          )}
        </div>

        {/* Right: Icon Box */}
        <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-stone-50 text-stone-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner">
          {/* We assume 'icon' is a Lucide component passed in */}
          {icon ? React.cloneElement(icon, { size: 24, strokeWidth: 1.5 }) : "📈"}
        </div>
      </div>
      
      {/* Bottom decorative accent line */}
      <div className="mt-6 h-1 w-0 group-hover:w-full bg-amber-500 transition-all duration-500 rounded-full" />
    </div>
  );
};

export default StatCard;