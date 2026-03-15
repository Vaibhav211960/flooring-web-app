import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box, ReceiptText, Users, Banknote,
  Package, AlertTriangle, ArrowRight, Loader2,
  ShoppingBag, Star,
} from "lucide-react";
// FIX: was either inlined or imported from wrong path
// NOW: imported from the actual StatCard file with the typo fixed
import StatCard from "../components/StatCard";

// ── Shared axios instance ──
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Status config — same as Orders.jsx ──
const STATUS_CONFIG = {
  pending:   { label: "Pending",   cls: "bg-amber-50 text-amber-700 border-amber-100"      },
  arriving:  { label: "Arriving",  cls: "bg-blue-50 text-blue-700 border-blue-100"         },
  delivered: { label: "Delivered", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-700 border-rose-100"         },
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ── Data states ──
  const [orders,    setOrders]    = useState([]);
  const [products,  setProducts]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch all data in parallel ──
  // OLD: no fetching at all — everything was hardcoded strings
  // NEW: Promise.all fetches all three in parallel — faster than sequential awaits
  // Promise.all means all three requests fire at the same time instead of one-by-one
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get("/orders/admin/getAll"),
        api.get("/products"),
        api.get("/users/getAllUsers"),
      ]);
      setOrders(ordersRes.data.orders   || []);
      setProducts(productsRes.data.products || []);
      setUsers(usersRes.data.users      || []);
    } catch {
      // Dashboard is read-only — silent fail is acceptable here,
      // cards will just show 0 instead of crashing
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── useMemo: all derived stats — only recompute when source data changes ──
  const stats = useMemo(() => {
    const totalRevenue  = orders.reduce((sum, o) => sum + (o.netBill || 0), 0);
    const activeOrders  = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "arriving").length;
    const lowStockCount = products.filter((p) => p.stock <= 200).length;
    const recentOrders  = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    // ── Trend calculation: compare this month vs last month ──
    // Used by StatCard's trend prop — shows ↑ / ↓ with % change
    const now           = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonthStart);
    const lastMonthOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const thisRevenue = thisMonthOrders.reduce((s, o) => s + (o.netBill || 0), 0);
    const lastRevenue = lastMonthOrders.reduce((s, o) => s + (o.netBill || 0), 0);

    // Helper: calculate % change between two numbers — returns { trend, value }
    const pctChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? { trend: "up", value: "New" } : { trend: "up", value: "—" };
      const pct = ((curr - prev) / prev) * 100;
      return {
        trend: pct >= 0 ? "up" : "down",
        value: `${Math.abs(pct).toFixed(1)}%`,
      };
    };

    const revenueTrend  = pctChange(thisRevenue, lastRevenue);
    const ordersTrend   = pctChange(thisMonthOrders.length, lastMonthOrders.length);
    // For users and products, compare total now vs last month's count using createdAt
    const usersThisMonth = users.filter((u) => new Date(u.createdAt) >= thisMonthStart).length;
    const usersLastMonth = users.filter((u) => {
      const d = new Date(u.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
    const usersTrend = pctChange(usersThisMonth, usersLastMonth);

    const prodsThisMonth = products.filter((p) => new Date(p.createdAt) >= thisMonthStart).length;
    const prodsLastMonth = products.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
    const productsTrend = pctChange(prodsThisMonth, prodsLastMonth);

    // Top 5 products by order frequency
    const productFreq = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        const key  = item.productId?.toString() || item.productName;
        const name = item.productName || "Unknown";
        if (!productFreq[key]) productFreq[key] = { name, count: 0, revenue: 0 };
        productFreq[key].count   += item.units || item.quantity || 1;
        productFreq[key].revenue += item.totalAmount || 0;
      });
    });
    const topProducts = Object.values(productFreq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenue by last 7 days — for the bar chart
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key        = d.toISOString().split("T")[0];
      const label      = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dayRevenue = orders
        .filter((o) => new Date(o.createdAt).toISOString().split("T")[0] === key)
        .reduce((sum, o) => sum + (o.netBill || 0), 0);
      return { label, revenue: dayRevenue };
    });
    const maxRevenue = Math.max(...last7.map((d) => d.revenue), 1);

    return {
      totalRevenue,
      activeOrders,
      totalProducts: products.length,
      totalUsers:    users.length,
      lowStockCount,
      recentOrders,
      topProducts,
      last7,
      maxRevenue,
      // trends
      revenueTrend,
      ordersTrend,
      usersTrend,
      productsTrend,
    };
  }, [orders, products, users]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Loading Dashboard...
      </p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Overview of store performance and activity.
          </p>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Low Stock Alert — same as Products page but on dashboard ── */}
      {stats.lowStockCount > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {stats.lowStockCount} {stats.lowStockCount === 1 ? "product is" : "products are"} running low on stock
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Review inventory before stock runs out
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/inventory")}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
          >
            Review Stock →
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString("en-IN")}
          icon={<Box />}
          trend={stats.productsTrend.trend}
          trendValue={stats.productsTrend.value}
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders.toLocaleString("en-IN")}
          icon={<ReceiptText />}
          trend={stats.ordersTrend.trend}
          trendValue={stats.ordersTrend.value}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalUsers.toLocaleString("en-IN")}
          icon={<Users />}
          trend={stats.usersTrend.trend}
          trendValue={stats.usersTrend.value}
        />
        <StatCard
          title="Gross Revenue"
          value={`₹${stats.totalRevenue >= 100000
            ? `${(stats.totalRevenue / 100000).toFixed(1)}L`
            : stats.totalRevenue >= 1000
            ? `${(stats.totalRevenue / 1000).toFixed(1)}k`
            : stats.totalRevenue.toLocaleString("en-IN")}`}
          icon={<Banknote />}
          trend={stats.revenueTrend.trend}
          trendValue={stats.revenueTrend.value}
        />
      </div>

      {/* ── Main Content Row ── */}
      {/* OLD: grid-cols-3 with only one card — empty space on right */}
      {/* NEW: proper 2-col split — revenue chart left, recent orders right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Revenue Chart — last 7 days bar chart built with pure CSS/div */}
        {/* No external chart library needed — keeps bundle small */}
        <div className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Revenue — Last 7 Days</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-0.5">
                Daily net billing
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
            >
              All Orders <ArrowRight size={13} />
            </button>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.last7.map((day, i) => {
              const heightPct = stats.maxRevenue > 0
                ? Math.max((day.revenue / stats.maxRevenue) * 100, day.revenue > 0 ? 8 : 2)
                : 2;
              const isToday = i === 6;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                  {/* Tooltip on hover */}
                  <div className="relative flex flex-col items-center">
                    <span className="absolute -top-6 text-[9px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.revenue > 0
                        ? `₹${day.revenue >= 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue}`
                        : "—"}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? "bg-amber-500"
                          : day.revenue > 0
                          ? "bg-stone-800 group-hover:bg-stone-700"
                          : "bg-stone-100"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    isToday ? "text-amber-600" : "text-stone-400"
                  }`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total this week */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
              Week Total
            </p>
            <p className="text-sm font-bold text-stone-900">
              ₹{stats.last7.reduce((s, d) => s + d.revenue, 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Recent Orders</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-0.5">
                Latest {stats.recentOrders.length} transactions
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-stone-50">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <ShoppingBag size={28} className="text-stone-200" />
                <p className="text-xs text-stone-400 italic">No orders yet.</p>
              </div>
            ) : (
              stats.recentOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.orderStatus?.toLowerCase()] ||
                  { label: order.orderStatus, cls: "bg-stone-50 text-stone-500 border-stone-100" };
                return (
                  <div
                    key={order._id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900 font-mono">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {order.shippingAddress?.fullName || "Guest"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      <p className="text-xs font-bold text-stone-800 min-w-[60px] text-right">
                        ₹{order.netBill?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Products + Quick Links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Top Selling Products */}
        <div className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Top Selling Products</h3>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-0.5">
                By order volume
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
            >
              All Products <ArrowRight size={13} />
            </button>
          </div>

          {stats.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Box size={28} className="text-stone-200" />
              <p className="text-xs text-stone-400 italic">No sales data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors">
                  {/* Rank */}
                  <span className={`text-[10px] font-black w-5 shrink-0 ${
                    i === 0 ? "text-amber-500"
                    : i === 1 ? "text-stone-400"
                    : i === 2 ? "text-amber-800"
                    : "text-stone-300"
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {product.count} units sold
                    </p>
                  </div>
                  <p className="text-xs font-bold text-amber-700 shrink-0">
                    ₹{product.revenue.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation Links */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100">
            <h3 className="font-serif text-base font-bold text-stone-900">Quick Access</h3>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-0.5">
              Jump to any module
            </p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: "Manage Products",     path: "/admin/products",     icon: Box,         color: "text-amber-600"  },
              { label: "View Orders",         path: "/admin/orders",       icon: ReceiptText,  color: "text-blue-500"   },
              { label: "Inventory / Stock",   path: "/admin/inventory",    icon: Package,      color: "text-rose-500"   },
              { label: "Customers",           path: "/admin/customers",    icon: Users,        color: "text-emerald-500" },
              { label: "Reviews & Ratings",   path: "/admin/feedback",     icon: Star,         color: "text-amber-500"  },
            ].map(({ label, path, icon: Icon, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all text-left group"
              >
                <Icon size={15} className={color} />
                <span className="text-xs font-bold text-stone-700 uppercase tracking-widest">
                  {label}
                </span>
                <ArrowRight size={13} className="ml-auto text-stone-300 group-hover:text-stone-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;