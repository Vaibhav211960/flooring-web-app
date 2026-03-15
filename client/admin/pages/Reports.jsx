import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet, Download, Loader2, Calendar,
  TrendingUp, ShoppingBag, Package, Layers,
  AlertTriangle, CheckCircle2,
} from "lucide-react";

// ── Shared axios instance ──
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// SHEETJS EXCEL EXPORT
// Uses SheetJS (xlsx) loaded dynamically from CDN — no npm install needed
// Produces a real .xlsx file with:
//   • Bold amber header row
//   • Auto-fitted column widths
//   • Dark total/summary rows
//   • Number cells as actual numbers (not strings) so Excel can sum them
// ─────────────────────────────────────────────────────────────────────────────

// Load SheetJS once and cache it — avoids re-fetching on every export
let _XLSX = null;
const getXLSX = () =>
  _XLSX
    ? Promise.resolve(_XLSX)
    : new Promise((resolve, reject) => {
        if (window.XLSX) { _XLSX = window.XLSX; return resolve(_XLSX); }
        const script   = document.createElement("script");
        script.src     = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload  = () => { _XLSX = window.XLSX; resolve(_XLSX); };
        script.onerror = () => reject(new Error("Failed to load SheetJS"));
        document.head.appendChild(script);
      });

// ── Colour constants (ARGB hex — no leading #) ──
const CLR = {
  headerBg:   "FF1C1917", // stone-900
  headerFg:   "FFFBBF24", // amber-400
  totalBg:    "FFF5F5F4", // stone-100
  totalFg:    "FF1C1917",
  amberFg:    "FFB45309", // amber-700
  bodyFg:     "FF292524", // stone-800
  subFg:      "FF78716C", // stone-500
  whiteBg:    "FFFFFFFF",
};

// ── Cell factory helpers ──
const cell = (v, type = "s") => ({ v, t: type });          // s=string, n=number
const numCell  = (v)  => ({ v: Number(v) || 0, t: "n" }); // real number Excel can SUM
const pctCell  = (v)  => ({ v, t: "s" });                  // keep % as string for display

// Apply fill + font to a cell object (mutates & returns)
const style = (c, bg, fg, bold = false, align = "left") => {
  c.s = {
    fill: { fgColor: { rgb: bg } },
    font: { color: { rgb: fg }, bold, name: "Arial", sz: 10 },
    alignment: { horizontal: align, vertical: "center", wrapText: false },
    border: {
      bottom: { style: "thin", color: { rgb: "FFE7E5E4" } },
      right:  { style: "thin", color: { rgb: "FFE7E5E4" } },
    },
  };
  return c;
};

const headerCell = (v)   => style(cell(v), CLR.headerBg, CLR.headerFg, true, "center");
const bodyCell   = (v)   => style(cell(v), CLR.whiteBg,  CLR.bodyFg,  false, "left");
const subCell    = (v)   => style(cell(v), CLR.whiteBg,  CLR.subFg,   false, "left");
const amberNum   = (v)   => style(numCell(v), CLR.whiteBg, CLR.amberFg, true,  "right");
const totalCell  = (v, isNum = false) =>
  style(isNum ? numCell(v) : cell(v), CLR.totalBg, CLR.totalFg, true, isNum ? "right" : "left");
const totalAmber = (v)   => style(numCell(v), CLR.totalBg, CLR.amberFg, true, "right");

// ── Build worksheet from header + data rows, return {ws, colWidths} ──
const buildSheet = (headers, dataRows, totalRow = null) => {
  const XLSX   = window.XLSX;
  const wsData = [
    headers.map(headerCell),
    ...dataRows,
    ...(totalRow ? [totalRow] : []),
  ];

  // Convert 2D cell array → worksheet object
  const ws = XLSX.utils.aoa_to_sheet(wsData.map((row) => row.map((c) => c.v)));

  // Re-apply our styled cell objects so styles survive
  wsData.forEach((row, r) =>
    row.forEach((c, col) => {
      const addr = XLSX.utils.encode_cell({ r, c: col });
      ws[addr]   = c;
    })
  );

  // Auto column widths — measure max content length per column
  const colWidths = headers.map((h, ci) => {
    const maxLen = Math.max(
      h.length,
      ...dataRows.map((row) => String(row[ci]?.v ?? "").length),
      ...(totalRow ? [String(totalRow[ci]?.v ?? "").length] : [])
    );
    return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
  });
  ws["!cols"]  = colWidths;
  ws["!rows"]  = [{ hpt: 20 }]; // header row height

  // Set ref range
  const lastRow = wsData.length;
  const lastCol = headers.length - 1;
  ws["!ref"]   = `A1:${XLSX.utils.encode_cell({ r: lastRow - 1, c: lastCol })}`;

  return ws;
};

// ── Download a workbook with one or more sheets ──
const downloadXLSX = (filename, sheets) => {
  const XLSX = window.XLSX;
  const wb   = XLSX.utils.book_new();
  sheets.forEach(({ name, ws }) => XLSX.utils.book_append_sheet(wb, ws, name));
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ─────────────────────────────────────────────────────────────────────────────
// DATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const toDateStr    = (d) => d.toISOString().split("T")[0];
const today        = new Date();
const DEFAULT_FROM = toDateStr(new Date(today.getFullYear(), today.getMonth(), 1));
const DEFAULT_TO   = toDateStr(today);

const fmtDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

// Use "INR" in exports — Excel handles plain ASCII better than ₹ symbol
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Reports = () => {
  const [orders,    setOrders]    = useState([]);
  const [products,  setProducts]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom,  setDateFrom]  = useState(DEFAULT_FROM);
  const [dateTo,    setDateTo]    = useState(DEFAULT_TO);
  const [activeTab, setActiveTab] = useState("revenue");

  // ── Fetch all data in parallel ──
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/orders/admin/getAll"),
        api.get("/products"),
      ]);
      setOrders(ordersRes.data.orders       || []);
      setProducts(productsRes.data.products || []);
    } catch {
      toast.error("Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter orders by date range ──
  const filteredOrders = useMemo(() => {
    const from = new Date(dateFrom);
    const to   = new Date(dateTo);
    to.setHours(23, 59, 59, 999); // include the full "to" day
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    });
  }, [orders, dateFrom, dateTo]);

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT DATA
  // ─────────────────────────────────────────────────────────────────────────

  // Report 1: Revenue by date
  const revenueReport = useMemo(() => {
    const byDate = {};
    filteredOrders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().split("T")[0];
      if (!byDate[key]) byDate[key] = { date: key, orders: 0, revenue: 0 };
      byDate[key].orders  += 1;
      byDate[key].revenue += o.netBill || 0;
    });
    const rows  = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    const total = rows.reduce((s, r) => s + r.revenue, 0);
    return { rows, total };
  }, [filteredOrders]);

  // Report 2: Orders detail
  const ordersReport = useMemo(() => {
    const byStatus = { pending: 0, arriving: 0, delivered: 0, cancelled: 0 };
    filteredOrders.forEach((o) => {
      const s = o.orderStatus?.toLowerCase();
      if (s in byStatus) byStatus[s]++;
    });
    return {
      total: filteredOrders.length,
      byStatus,
      rows: filteredOrders.map((o) => ({
        id:          o._id.slice(-8).toUpperCase(),
        customer:    o.shippingAddress?.fullName || "Guest",
        phone:       o.shippingAddress?.contact  || "—",
        address:     o.shippingAddress?.address  || "—",
        date:        new Date(o.createdAt).toLocaleDateString("en-IN"),
        paymentMode: o.paymentMode               || "—",
        status:      o.orderStatus               || "—",
        items:       o.items?.length             || 0,
        amount:      o.netBill                   || 0,
      })),
    };
  }, [filteredOrders]);

  // Report 3: Best selling products
  const productsReport = useMemo(() => {
    const freq = {};
    filteredOrders.forEach((o) => {
      o.items?.forEach((item) => {
        // Use productId as the grouping key — most reliable unique identifier
        // Fall back to productName only if no productId (old orders)
        const groupKey = item.productId?.toString() || item.productName || "unknown";
        const name     = item.productName || item.name || `Product (${groupKey.slice(-6)})`;
        if (!freq[groupKey]) freq[groupKey] = { key: groupKey, name, units: 0, revenue: 0, orders: 0 };
        freq[groupKey].units   += item.units || item.quantity || 1;
        freq[groupKey].revenue += item.totalAmount            || 0;
        freq[groupKey].orders  += 1;
      });
    });
    return Object.values(freq).sort((a, b) => b.units - a.units);
  }, [filteredOrders]);

  // Report 4: Category breakdown
  const categoryReport = useMemo(() => {
    const catMap = {};
    products.forEach((p) => {
      catMap[p._id?.toString()] = p.subCategoryId?.name || "Uncategorised";
    });
    const byCat = {};
    filteredOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const cat = catMap[item.productId?.toString()] || "Uncategorised";
        if (!byCat[cat]) byCat[cat] = { category: cat, units: 0, revenue: 0, orders: 0 };
        byCat[cat].units   += item.units || item.quantity || 1;
        byCat[cat].revenue += item.totalAmount            || 0;
        byCat[cat].orders  += 1;
      });
    });
    return Object.values(byCat).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, products]);

  // ─────────────────────────────────────────────────────────────────────────
  // EXCEL EXPORT FUNCTIONS — styled .xlsx via SheetJS
  // ─────────────────────────────────────────────────────────────────────────
  const fileLabel = `${dateFrom}_to_${dateTo}`;

  const exportRevenue = useCallback(async () => {
    if (!revenueReport.rows.length) { toast.error("No revenue data to export."); return; }
    await getXLSX();
    const avgAll = filteredOrders.length > 0
      ? Math.round(revenueReport.total / filteredOrders.length) : 0;

    const ws = buildSheet(
      ["Date", "No. of Orders", "Revenue (INR)", "Avg Order Value (INR)"],
      revenueReport.rows.map((r) => [
        bodyCell(fmtDate(r.date)),
        style(numCell(r.orders),  CLR.whiteBg, CLR.bodyFg, false, "center"),
        amberNum(r.revenue),
        amberNum(r.orders > 0 ? Math.round(r.revenue / r.orders) : 0),
      ]),
      // Total row
      [
        totalCell("TOTAL"),
        totalCell(filteredOrders.length, true),
        totalAmber(revenueReport.total),
        totalAmber(avgAll),
      ]
    );
    downloadXLSX(`Revenue_Report_${fileLabel}`, [{ name: "Revenue", ws }]);
    toast.success("Revenue_Report.xlsx downloaded.");
  }, [revenueReport, filteredOrders, fileLabel]);

  const exportOrders = useCallback(async () => {
    if (!ordersReport.rows.length) { toast.error("No orders to export."); return; }
    await getXLSX();

    const ws = buildSheet(
      ["Order ID", "Customer Name", "Phone", "Delivery Address",
       "Order Date", "Payment Mode", "Status", "No. of Items", "Total Amount (INR)"],
      ordersReport.rows.map((r) => [
        style(cell(`#${r.id}`), CLR.whiteBg, CLR.subFg, false, "left"),
        bodyCell(r.customer),
        subCell(r.phone),
        subCell(r.address),
        subCell(r.date),
        style(cell(r.paymentMode.toUpperCase()), CLR.whiteBg, CLR.subFg, false, "center"),
        style(cell(r.status.toUpperCase()), CLR.whiteBg, CLR.bodyFg, true, "center"),
        style(numCell(r.items), CLR.whiteBg, CLR.subFg, false, "center"),
        amberNum(r.amount),
      ])
    );
    downloadXLSX(`Orders_Report_${fileLabel}`, [{ name: "Orders", ws }]);
    toast.success("Orders_Report.xlsx downloaded.");
  }, [ordersReport, fileLabel]);

  const exportProducts = useCallback(async () => {
    if (!productsReport.length) { toast.error("No product data to export."); return; }
    await getXLSX();

    const ws = buildSheet(
      ["Rank", "Product Name", "Units Sold", "No. of Orders", "Total Revenue (INR)"],
      productsReport.map((r, i) => [
        style(cell(`#${i + 1}`), CLR.whiteBg, CLR.amberFg, true, "center"),
        bodyCell(r.name),
        style(numCell(r.units),   CLR.whiteBg, CLR.bodyFg, false, "center"),
        style(numCell(r.orders),  CLR.whiteBg, CLR.subFg,  false, "center"),
        amberNum(r.revenue),
      ])
    );
    downloadXLSX(`BestSelling_Products_${fileLabel}`, [{ name: "Best Products", ws }]);
    toast.success("BestSelling_Products.xlsx downloaded.");
  }, [productsReport, fileLabel]);

  const exportCategories = useCallback(async () => {
    if (!categoryReport.length) { toast.error("No category data to export."); return; }
    await getXLSX();
    const totalRev = categoryReport.reduce((s, r) => s + r.revenue, 0);

    const ws = buildSheet(
      ["Sub-Category", "Units Sold", "No. of Orders", "Revenue (INR)", "% of Total Revenue"],
      categoryReport.map((r) => [
        bodyCell(r.category),
        style(numCell(r.units),  CLR.whiteBg, CLR.bodyFg, false, "center"),
        style(numCell(r.orders), CLR.whiteBg, CLR.subFg,  false, "center"),
        amberNum(r.revenue),
        pctCell(totalRev > 0 ? `${((r.revenue / totalRev) * 100).toFixed(1)}%` : "0%"),
      ]),
      // Total row
      [
        totalCell("TOTAL"),
        totalCell(categoryReport.reduce((s, r) => s + r.units, 0), true),
        totalCell(categoryReport.reduce((s, r) => s + r.orders, 0), true),
        totalAmber(totalRev),
        totalCell("100%"),
      ]
    );
    downloadXLSX(`Category_Breakdown_${fileLabel}`, [{ name: "By Category", ws }]);
    toast.success("Category_Breakdown.xlsx downloaded.");
  }, [categoryReport, fileLabel]);

  // ── Download All 4 reports into ONE workbook with 4 sheets ──
  // Much cleaner than 4 separate files — admin gets one file, opens 4 tabs
  const exportAll = useCallback(async () => {
    if (!filteredOrders.length) { toast.error("No orders in this date range."); return; }
    try {
      await getXLSX();
      toast.loading("Building Excel workbook...", { id: "export-all" });

      const avgAll = filteredOrders.length > 0
        ? Math.round(revenueReport.total / filteredOrders.length) : 0;
      const totalRev = categoryReport.reduce((s, r) => s + r.revenue, 0);

      const ws1 = buildSheet(
        ["Date", "No. of Orders", "Revenue (INR)", "Avg Order Value (INR)"],
        revenueReport.rows.map((r) => [
          bodyCell(fmtDate(r.date)),
          style(numCell(r.orders), CLR.whiteBg, CLR.bodyFg, false, "center"),
          amberNum(r.revenue),
          amberNum(r.orders > 0 ? Math.round(r.revenue / r.orders) : 0),
        ]),
        [totalCell("TOTAL"), totalCell(filteredOrders.length, true), totalAmber(revenueReport.total), totalAmber(avgAll)]
      );

      const ws2 = buildSheet(
        ["Order ID", "Customer Name", "Phone", "Order Date", "Payment Mode", "Status", "Items", "Amount (INR)"],
        ordersReport.rows.map((r) => [
          style(cell(`#${r.id}`), CLR.whiteBg, CLR.subFg, false, "left"),
          bodyCell(r.customer),
          subCell(r.phone),
          subCell(r.date),
          style(cell(r.paymentMode.toUpperCase()), CLR.whiteBg, CLR.subFg, false, "center"),
          style(cell(r.status.toUpperCase()), CLR.whiteBg, CLR.bodyFg, true, "center"),
          style(numCell(r.items), CLR.whiteBg, CLR.subFg, false, "center"),
          amberNum(r.amount),
        ])
      );

      const ws3 = buildSheet(
        ["Rank", "Product Name", "Units Sold", "No. of Orders", "Revenue (INR)"],
        productsReport.map((r, i) => [
          style(cell(`#${i + 1}`), CLR.whiteBg, CLR.amberFg, true, "center"),
          bodyCell(r.name),
          style(numCell(r.units),  CLR.whiteBg, CLR.bodyFg, false, "center"),
          style(numCell(r.orders), CLR.whiteBg, CLR.subFg,  false, "center"),
          amberNum(r.revenue),
        ])
      );

      const ws4 = buildSheet(
        ["Sub-Category", "Units Sold", "No. of Orders", "Revenue (INR)", "% of Total"],
        categoryReport.map((r) => [
          bodyCell(r.category),
          style(numCell(r.units),  CLR.whiteBg, CLR.bodyFg, false, "center"),
          style(numCell(r.orders), CLR.whiteBg, CLR.subFg,  false, "center"),
          amberNum(r.revenue),
          pctCell(totalRev > 0 ? `${((r.revenue / totalRev) * 100).toFixed(1)}%` : "0%"),
        ]),
        [totalCell("TOTAL"), totalCell(categoryReport.reduce((s, r) => s + r.units, 0), true),
         totalCell(categoryReport.reduce((s, r) => s + r.orders, 0), true), totalAmber(totalRev), totalCell("100%")]
      );

      downloadXLSX(`Full_Report_${fileLabel}`, [
        { name: "Revenue",      ws: ws1 },
        { name: "Orders",       ws: ws2 },
        { name: "Best Products",ws: ws3 },
        { name: "By Category",  ws: ws4 },
      ]);

      toast.success("Full_Report.xlsx downloaded — 4 sheets inside!", { id: "export-all" });
    } catch (err) {
      toast.error("Export failed. Please try again.", { id: "export-all" });
    }
  }, [filteredOrders, revenueReport, ordersReport, productsReport, categoryReport, fileLabel]);

  // ── Export current tab only ──
  const exportCurrentTab = useCallback(() => {
    const map = {
      revenue:    exportRevenue,
      orders:     exportOrders,
      products:   exportProducts,
      categories: exportCategories,
    };
    map[activeTab]?.();
  }, [activeTab, exportRevenue, exportOrders, exportProducts, exportCategories]);

  // ── Tabs ──
  const TABS = [
    { key: "revenue",    label: "Revenue",      icon: TrendingUp  },
    { key: "orders",     label: "Orders",        icon: ShoppingBag },
    { key: "products",   label: "Best Products", icon: Package     },
    { key: "categories", label: "By Category",   icon: Layers      },
  ];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
        Building Reports...
      </p>
    </div>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Reports</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Sales analytics — export directly to Excel.
          </p>
        </div>
        <button
          onClick={exportAll}
          disabled={filteredOrders.length === 0}
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <Download size={13} /> Download All Reports
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
        <Calendar size={15} className="text-amber-600 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Date Range</span>
        <div className="flex items-center gap-2">
          <input
            type="date" value={dateFrom} max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all bg-stone-50"
          />
          <span className="text-stone-300 font-bold">→</span>
          <input
            type="date" value={dateTo} min={dateFrom} max={toDateStr(today)}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all bg-stone-50"
          />
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {[
            { label: "This Month", from: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)),     to: toDateStr(today) },
            { label: "Last Month", from: toDateStr(new Date(today.getFullYear(), today.getMonth() - 1, 1)), to: toDateStr(new Date(today.getFullYear(), today.getMonth(), 0)) },
            { label: "This Year",  from: toDateStr(new Date(today.getFullYear(), 0, 1)),                     to: toDateStr(today) },
          ].map(({ label: l, from, to }) => (
            <button key={l} onClick={() => { setDateFrom(from); setDateTo(to); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                dateFrom === from && dateTo === to
                  ? "bg-stone-900 text-amber-400 border-stone-900"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
              }`}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* No data warning */}
      {filteredOrders.length === 0 && (
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            No orders found for this date range. Try adjusting the dates above.
          </p>
        </div>
      )}

      {/* Tab bar + Export current tab */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
          {TABS.map(({ key, label: l, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === key
                  ? "bg-white text-stone-900 shadow-sm border border-stone-200"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <Icon size={13} /> {l}
            </button>
          ))}
        </div>
        <button
          onClick={exportCurrentTab}
          disabled={filteredOrders.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 active:scale-95 shadow-sm"
        >
          <FileSpreadsheet size={13} /> Export This Report
        </button>
      </div>

      {/* Report preview table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Revenue */}
        {activeTab === "revenue" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-stone-100">
              {[
                { label: "Total Revenue",   value: fmtINR(revenueReport.total) },
                { label: "Total Orders",    value: filteredOrders.length },
                { label: "Avg Order Value", value: filteredOrders.length > 0 ? fmtINR(Math.round(revenueReport.total / filteredOrders.length)) : "—" },
              ].map(({ label: l, value }) => (
                <div key={l} className="bg-white px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{l}</p>
                  <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
            <ReportTable headers={["Date", "No. of Orders", "Revenue", "Avg Order Value"]}>
              {revenueReport.rows.length === 0 ? <EmptyRow cols={4} /> : <>
                {revenueReport.rows.map((r) => (
                  <tr key={r.date} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-stone-700">{fmtDate(r.date)}</td>
                    <td className="p-4 text-sm text-stone-600">{r.orders}</td>
                    <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.revenue)}</td>
                    <td className="p-4 text-sm text-stone-500">
                      {r.orders > 0 ? fmtINR(Math.round(r.revenue / r.orders)) : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-stone-50 border-t-2 border-stone-200">
                  <td className="p-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Total</td>
                  <td className="p-4 text-sm font-bold text-stone-900">{filteredOrders.length}</td>
                  <td className="p-4 text-sm font-black text-amber-700">{fmtINR(revenueReport.total)}</td>
                  <td className="p-4 text-sm font-bold text-stone-500">
                    {filteredOrders.length > 0 ? fmtINR(Math.round(revenueReport.total / filteredOrders.length)) : "—"}
                  </td>
                </tr>
              </>}
            </ReportTable>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-100">
              {Object.entries(ordersReport.byStatus).map(([status, count]) => (
                <div key={status} className="bg-white px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{status}</p>
                  <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{count}</p>
                </div>
              ))}
            </div>
            <ReportTable headers={["Order ID", "Customer", "Phone", "Date", "Payment", "Status", "Items", "Amount"]}>
              {ordersReport.rows.length === 0 ? <EmptyRow cols={8} /> : (
                ordersReport.rows.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-[10px] font-mono font-bold text-stone-500">#{r.id}</td>
                    <td className="p-4 text-sm font-medium text-stone-800">{r.customer}</td>
                    <td className="p-4 text-xs text-stone-500">{r.phone}</td>
                    <td className="p-4 text-xs text-stone-500">{r.date}</td>
                    <td className="p-4 text-xs font-medium text-stone-600 uppercase">{r.paymentMode}</td>
                    <td className="p-4"><StatusBadge status={r.status} /></td>
                    <td className="p-4 text-xs text-stone-500">{r.items}</td>
                    <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.amount)}</td>
                  </tr>
                ))
              )}
            </ReportTable>
          </div>
        )}

        {/* Best Products */}
        {activeTab === "products" && (
          <ReportTable headers={["Rank", "Product Name", "Units Sold", "No. of Orders", "Total Revenue"]}>
            {productsReport.length === 0 ? <EmptyRow cols={5} /> : (
              productsReport.map((r, i) => (
                // FIX: was key={r.name} — if multiple items had name "Product" React
                // threw "duplicate key" and skipped rendering those rows entirely
                // NEW: key={r.key} uses the productId-based grouping key — always unique
                <tr key={r.key} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4">
                    <span className={`text-[11px] font-black ${
                      i === 0 ? "text-amber-500" : i === 1 ? "text-stone-400" : i === 2 ? "text-amber-800" : "text-stone-300"
                    }`}>#{i + 1}</span>
                  </td>
                  <td className="p-4 text-sm font-bold text-stone-900">{r.name}</td>
                  <td className="p-4 text-sm font-medium text-stone-600">{r.units}</td>
                  <td className="p-4 text-sm text-stone-500">{r.orders}</td>
                  <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.revenue)}</td>
                </tr>
              ))
            )}
          </ReportTable>
        )}

        {/* Categories */}
        {activeTab === "categories" && (() => {
          const totalRev = categoryReport.reduce((s, r) => s + r.revenue, 0);
          return (
            <ReportTable headers={["Sub-Category", "Units Sold", "No. of Orders", "Revenue", "% of Total"]}>
              {categoryReport.length === 0 ? <EmptyRow cols={5} /> : (
                categoryReport.map((r) => (
                  <tr key={r.category} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-stone-900">{r.category}</td>
                    <td className="p-4 text-sm text-stone-600">{r.units}</td>
                    <td className="p-4 text-sm text-stone-500">{r.orders}</td>
                    <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.revenue)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden min-w-[60px]">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${totalRev > 0 ? (r.revenue / totalRev) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-stone-500 w-10 text-right shrink-0">
                          {totalRev > 0 ? `${((r.revenue / totalRev) * 100).toFixed(1)}%` : "0%"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </ReportTable>
          );
        })()}
      </div>

      {/* Status hint */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium">
            {filteredOrders.length} orders loaded for{" "}
            <strong>{fmtDate(dateFrom)}</strong> → <strong>{fmtDate(dateTo)}</strong>.{" "}
            Click <strong>Export This Report</strong> to download the current tab as Excel,
            or <strong>Download All Reports</strong> to get all 4 files at once.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Shared table shell ──
const ReportTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-stone-50 border-b border-stone-200">
        <tr>
          {headers.map((h) => (
            <th key={h} className="p-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-100">{children}</tbody>
    </table>
  </div>
);

// ── Empty row ──
const EmptyRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="py-16 text-center text-stone-400 italic text-sm">
      No data for this date range.
    </td>
  </tr>
);

// ── Status badge ──
const STATUS_CLS = {
  pending:   "bg-amber-50 text-amber-700 border-amber-100",
  arriving:  "bg-blue-50 text-blue-700 border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
    STATUS_CLS[status?.toLowerCase()] || "bg-stone-50 text-stone-500 border-stone-100"
  }`}>
    {status || "—"}
  </span>
);

export default Reports;