import React, { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet, Download, Loader2, Calendar,
  TrendingUp, ShoppingBag, Package, Layers,
  AlertTriangle, CheckCircle2, RefreshCw,
} from "lucide-react";

// ── Shared axios instance ──
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _XLSX = null;
const getXLSX = () =>
  _XLSX ? Promise.resolve(_XLSX)
  : new Promise((resolve, reject) => {
      if (window.XLSX) { _XLSX = window.XLSX; return resolve(_XLSX); }
      const script   = document.createElement("script");
      script.src     = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload  = () => { _XLSX = window.XLSX; resolve(_XLSX); };
      script.onerror = () => reject(new Error("Failed to load SheetJS"));
      document.head.appendChild(script);
    });

const CLR = {
  headerBg: "FF1C1917", headerFg: "FFFBBF24",
  totalBg:  "FFF5F5F4", totalFg:  "FF1C1917",
  amberFg:  "FFB45309", bodyFg:   "FF292524",
  subFg:    "FF78716C", whiteBg:  "FFFFFFFF",
};

const cell    = (v, type = "s") => ({ v, t: type });
const numCell = (v) => ({ v: Number(v) || 0, t: "n" });
const pctCell = (v) => ({ v, t: "s" });

const style = (c, bg, fg, bold = false, align = "left") => {
  c.s = {
    fill: { fgColor: { rgb: bg } },
    font: { color: { rgb: fg }, bold, name: "Arial", sz: 10 },
    alignment: { horizontal: align, vertical: "center" },
    border: { bottom: { style: "thin", color: { rgb: "FFE7E5E4" } }, right: { style: "thin", color: { rgb: "FFE7E5E4" } } },
  };
  return c;
};

const headerCell = (v)         => style(cell(v),    CLR.headerBg, CLR.headerFg, true,  "center");
const bodyCell   = (v)         => style(cell(v),    CLR.whiteBg,  CLR.bodyFg,  false, "left");
const subCell    = (v)         => style(cell(v),    CLR.whiteBg,  CLR.subFg,   false, "left");
const amberNum   = (v)         => style(numCell(v), CLR.whiteBg,  CLR.amberFg, true,  "right");
const totalCell  = (v, n=false)=> style(n ? numCell(v) : cell(v), CLR.totalBg, CLR.totalFg, true, n ? "right" : "left");
const totalAmber = (v)         => style(numCell(v), CLR.totalBg,  CLR.amberFg, true,  "right");

const buildSheet = (headers, dataRows, totalRow = null) => {
  const XLSX   = window.XLSX;
  const wsData = [headers.map(headerCell), ...dataRows, ...(totalRow ? [totalRow] : [])];
  const ws     = XLSX.utils.aoa_to_sheet(wsData.map((row) => row.map((c) => c.v)));
  wsData.forEach((row, r) => row.forEach((c, col) => { ws[XLSX.utils.encode_cell({ r, c: col })] = c; }));
  ws["!cols"] = headers.map((h, ci) => ({
    wch: Math.min(Math.max(h.length, ...dataRows.map((row) => String(row[ci]?.v ?? "").length), ...(totalRow ? [String(totalRow[ci]?.v ?? "").length] : [])) + 4, 40),
  }));
  ws["!rows"] = [{ hpt: 20 }];
  ws["!ref"]  = `A1:${XLSX.utils.encode_cell({ r: wsData.length - 1, c: headers.length - 1 })}`;
  return ws;
};

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
const fmtDate      = (s) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtINR       = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Reports = () => {
  const [dateFrom,  setDateFrom]  = useState(DEFAULT_FROM);
  const [dateTo,    setDateTo]    = useState(DEFAULT_TO);
  const [activeTab, setActiveTab] = useState("revenue");

  // ── One state object per report — each holds { data, isLoading, error } ──
  // OLD: one giant state with all 500 orders + all products loaded upfront
  // NEW: each report is fetched independently — only what's needed, when it's needed
  const [revenue,    setRevenue]    = useState({ data: null, isLoading: false });
  const [orders,     setOrders]     = useState({ data: null, isLoading: false });
  const [products,   setProducts]   = useState({ data: null, isLoading: false });
  const [categories, setCategories] = useState({ data: null, isLoading: false });

  // ── Fetch a specific report from its dedicated pipeline endpoint ──
  // Each call sends only ?from=&to= — backend does all grouping/summing
  const fetchReport = useCallback(async (tab, from, to) => {
    const setters = { revenue: setRevenue, orders: setOrders, products: setProducts, categories: setCategories };
    const urls    = {
      revenue:    "/orders/admin/reports/revenue",
      orders:     "/orders/admin/reports/orders",
      products:   "/orders/admin/reports/products",
      categories: "/orders/admin/reports/categories",
    };
    const setter = setters[tab];
    setter((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await api.get(urls[tab], { params: { from, to } });
      setter({ data: res.data, isLoading: false });
    } catch {
      toast.error(`Failed to load ${tab} report.`);
      setter((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ── Fetch report when tab changes or dates change ──
  // useCallback so this doesn't re-create on every render
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Only fetch if no data yet or if we want fresh data
    const stateMap = { revenue, orders, products, categories };
    if (!stateMap[tab].data) fetchReport(tab, dateFrom, dateTo);
  }, [revenue, orders, products, categories, fetchReport, dateFrom, dateTo]);

  // When dates change, invalidate all loaded data and refetch current tab
  const handleDateChange = useCallback((from, to) => {
    setRevenue({ data: null, isLoading: false });
    setOrders({ data: null, isLoading: false });
    setProducts({ data: null, isLoading: false });
    setCategories({ data: null, isLoading: false });
    fetchReport(activeTab, from, to);
  }, [activeTab, fetchReport]);

  const applyDates = useCallback((from, to) => {
    setDateFrom(from);
    setDateTo(to);
    handleDateChange(from, to);
  }, [handleDateChange]);

  // Initial load on mount
  React.useEffect(() => {
    fetchReport("revenue", DEFAULT_FROM, DEFAULT_TO);
  }, []); // eslint-disable-line

  // Current tab's state
  const currentState = { revenue, orders, products, categories }[activeTab];
  const isLoading    = currentState?.isLoading;
  const hasData      = !!currentState?.data;

  // ── TABS ──
  const TABS = [
    { key: "revenue",    label: "Revenue",      icon: TrendingUp  },
    { key: "orders",     label: "Orders",        icon: ShoppingBag },
    { key: "products",   label: "Best Products", icon: Package     },
    { key: "categories", label: "By Category",   icon: Layers      },
  ];

  // ── EXPORT HANDLERS ──
  const fileLabel = `${dateFrom}_to_${dateTo}`;

  const exportRevenue = useCallback(async () => {
    const d = revenue.data;
    if (!d?.rows?.length) { toast.error("No data to export."); return; }
    await getXLSX();
    const ws = buildSheet(
      ["Date", "No. of Orders", "Revenue (INR)", "Avg Order Value (INR)"],
      d.rows.map((r) => [
        bodyCell(fmtDate(r.date)),
        style(numCell(r.orderCount), CLR.whiteBg, CLR.bodyFg, false, "center"),
        amberNum(r.revenue),
        amberNum(r.avgOrderValue),
      ]),
      [totalCell("TOTAL"), totalCell(d.summary.totalOrders, true), totalAmber(d.summary.totalRevenue), totalAmber(d.summary.avgOrderValue)]
    );
    downloadXLSX(`Revenue_Report_${fileLabel}`, [{ name: "Revenue", ws }]);
    toast.success("Revenue_Report.xlsx downloaded.");
  }, [revenue, fileLabel]);

  const exportOrders = useCallback(async () => {
    const d = orders.data;
    if (!d?.rows?.length) { toast.error("No data to export."); return; }
    await getXLSX();
    const ws = buildSheet(
      ["Order ID", "Customer Name", "Phone", "Delivery Address", "Order Date", "Payment Mode", "Status", "Items", "Amount (INR)"],
      d.rows.map((r) => [
        style(cell(`#${r._id.slice(-8).toUpperCase()}`), CLR.whiteBg, CLR.subFg, false, "left"),
        bodyCell(r.fullName || "Guest"),
        subCell(r.contact || "—"),
        subCell(r.address || "—"),
        subCell(new Date(r.createdAt).toLocaleDateString("en-IN")),
        style(cell((r.paymentMode || "—").toUpperCase()), CLR.whiteBg, CLR.subFg, false, "center"),
        style(cell((r.orderStatus || "—").toUpperCase()), CLR.whiteBg, CLR.bodyFg, true, "center"),
        style(numCell(r.itemCount), CLR.whiteBg, CLR.subFg, false, "center"),
        amberNum(r.netBill),
      ])
    );
    downloadXLSX(`Orders_Report_${fileLabel}`, [{ name: "Orders", ws }]);
    toast.success("Orders_Report.xlsx downloaded.");
  }, [orders, fileLabel]);

  const exportProducts = useCallback(async () => {
    const d = products.data;
    if (!d?.rows?.length) { toast.error("No data to export."); return; }
    await getXLSX();
    const ws = buildSheet(
      ["Rank", "Product Name", "Units Sold", "No. of Orders", "Total Revenue (INR)"],
      d.rows.map((r, i) => [
        style(cell(`#${i + 1}`), CLR.whiteBg, CLR.amberFg, true, "center"),
        bodyCell(r.productName),
        style(numCell(r.unitsSold),    CLR.whiteBg, CLR.bodyFg, false, "center"),
        style(numCell(r.orderCount),   CLR.whiteBg, CLR.subFg,  false, "center"),
        amberNum(r.totalRevenue),
      ])
    );
    downloadXLSX(`BestSelling_Products_${fileLabel}`, [{ name: "Best Products", ws }]);
    toast.success("BestSelling_Products.xlsx downloaded.");
  }, [products, fileLabel]);

  const exportCategories = useCallback(async () => {
    const d = categories.data;
    if (!d?.rows?.length) { toast.error("No data to export."); return; }
    await getXLSX();
    const ws = buildSheet(
      ["Sub-Category", "Units Sold", "No. of Orders", "Revenue (INR)", "% of Total Revenue"],
      d.rows.map((r) => [
        bodyCell(r.categoryName),
        style(numCell(r.unitsSold),  CLR.whiteBg, CLR.bodyFg, false, "center"),
        style(numCell(r.orderCount), CLR.whiteBg, CLR.subFg,  false, "center"),
        amberNum(r.totalRevenue),
        pctCell(`${r.percentOfTotal}%`),
      ]),
      [totalCell("TOTAL"),
       totalCell(d.rows.reduce((s, r) => s + r.unitsSold, 0), true),
       totalCell(d.rows.reduce((s, r) => s + r.orderCount, 0), true),
       totalAmber(d.grandTotal),
       totalCell("100%")]
    );
    downloadXLSX(`Category_Breakdown_${fileLabel}`, [{ name: "By Category", ws }]);
    toast.success("Category_Breakdown.xlsx downloaded.");
  }, [categories, fileLabel]);

  const exportCurrentTab = useCallback(() => {
    ({ revenue: exportRevenue, orders: exportOrders, products: exportProducts, categories: exportCategories })[activeTab]?.();
  }, [activeTab, exportRevenue, exportOrders, exportProducts, exportCategories]);

  const exportAll = useCallback(async () => {
    const allLoaded = revenue.data && orders.data && products.data && categories.data;
    if (!allLoaded) {
      toast.loading("Loading all reports first...", { id: "load-all" });
      await Promise.all([
        fetchReport("revenue",    dateFrom, dateTo),
        fetchReport("orders",     dateFrom, dateTo),
        fetchReport("products",   dateFrom, dateTo),
        fetchReport("categories", dateFrom, dateTo),
      ]);
      toast.dismiss("load-all");
    }
    try {
      await getXLSX();
      toast.loading("Building Excel workbook...", { id: "export-all" });
      // Small delay to let state settle after fetches
      await new Promise((r) => setTimeout(r, 300));
      exportRevenue();
      setTimeout(() => exportOrders(),    400);
      setTimeout(() => exportProducts(),  800);
      setTimeout(() => exportCategories(),1200);
      toast.success("All 4 reports downloading!", { id: "export-all" });
    } catch {
      toast.error("Export failed.", { id: "export-all" });
    }
  }, [revenue, orders, products, categories, fetchReport, dateFrom, dateTo,
      exportRevenue, exportOrders, exportProducts, exportCategories]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Reports</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Pipeline-powered analytics — computed by MongoDB, not the browser.
          </p>
        </div>
        <button
          onClick={exportAll}
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 text-amber-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95"
        >
          <Download size={13} /> Download All Reports
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
        <Calendar size={15} className="text-amber-600 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Date Range</span>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all bg-stone-50" />
          <span className="text-stone-300 font-bold">→</span>
          <input type="date" value={dateTo} min={dateFrom} max={toDateStr(today)}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all bg-stone-50" />
          <button
            onClick={() => handleDateChange(dateFrom, dateTo)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-700 transition-all"
          >
            <RefreshCw size={12} /> Apply
          </button>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {[
            { label: "This Month", from: toDateStr(new Date(today.getFullYear(), today.getMonth(), 1)),     to: toDateStr(today) },
            { label: "Last Month", from: toDateStr(new Date(today.getFullYear(), today.getMonth() - 1, 1)), to: toDateStr(new Date(today.getFullYear(), today.getMonth(), 0)) },
            { label: "This Year",  from: toDateStr(new Date(today.getFullYear(), 0, 1)),                     to: toDateStr(today) },
          ].map(({ label: l, from, to }) => (
            <button key={l} onClick={() => applyDates(from, to)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                dateFrom === from && dateTo === to
                  ? "bg-stone-900 text-amber-400 border-stone-900"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
              }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Tab bar + Export button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
          {TABS.map(({ key, label: l, icon: Icon }) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === key ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-400 hover:text-stone-700"
              }`}>
              <Icon size={13} /> {l}
            </button>
          ))}
        </div>
        <button onClick={exportCurrentTab} disabled={!hasData}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 active:scale-95 shadow-sm">
          <FileSpreadsheet size={13} /> Export This Report
        </button>
      </div>

      {/* Report area */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Running pipeline...
            </p>
          </div>
        )}

        {/* No data yet */}
        {!isLoading && !hasData && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle size={28} className="text-stone-200" />
            <p className="text-sm text-stone-400 italic">No data for this period.</p>
          </div>
        )}

        {/* ── Revenue Tab ── */}
        {!isLoading && activeTab === "revenue" && revenue.data && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-stone-100">
              {[
                { label: "Total Revenue",   value: fmtINR(revenue.data.summary.totalRevenue) },
                { label: "Total Orders",    value: revenue.data.summary.totalOrders },
                { label: "Avg Order Value", value: fmtINR(revenue.data.summary.avgOrderValue) },
              ].map(({ label: l, value }) => (
                <div key={l} className="bg-white px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{l}</p>
                  <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
            <ReportTable headers={["Date", "No. of Orders", "Revenue", "Avg Order Value"]}>
              {revenue.data.rows.length === 0 ? <EmptyRow cols={4} /> : <>
                {revenue.data.rows.map((r) => (
                  <tr key={r.date} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-stone-700">{fmtDate(r.date)}</td>
                    <td className="p-4 text-sm text-stone-600">{r.orderCount}</td>
                    <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.revenue)}</td>
                    <td className="p-4 text-sm text-stone-500">{fmtINR(r.avgOrderValue)}</td>
                  </tr>
                ))}
                <tr className="bg-stone-50 border-t-2 border-stone-200">
                  <td className="p-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Total</td>
                  <td className="p-4 text-sm font-bold text-stone-900">{revenue.data.summary.totalOrders}</td>
                  <td className="p-4 text-sm font-black text-amber-700">{fmtINR(revenue.data.summary.totalRevenue)}</td>
                  <td className="p-4 text-sm font-bold text-stone-500">{fmtINR(revenue.data.summary.avgOrderValue)}</td>
                </tr>
              </>}
            </ReportTable>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {!isLoading && activeTab === "orders" && orders.data && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-100">
              {Object.entries(orders.data.byStatus).map(([status, count]) => (
                <div key={status} className="bg-white px-6 py-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{status}</p>
                  <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{count}</p>
                </div>
              ))}
            </div>
            <ReportTable headers={["Order ID", "Customer", "Phone", "Date", "Payment", "Status", "Items", "Amount"]}>
              {orders.data.rows.length === 0 ? <EmptyRow cols={8} /> : (
                orders.data.rows.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4 text-[10px] font-mono font-bold text-stone-500">#{r._id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm font-medium text-stone-800">{r.fullName || "Guest"}</td>
                    <td className="p-4 text-xs text-stone-500">{r.contact || "—"}</td>
                    <td className="p-4 text-xs text-stone-500">{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-xs font-medium text-stone-600 uppercase">{r.paymentMode}</td>
                    <td className="p-4"><StatusBadge status={r.orderStatus} /></td>
                    <td className="p-4 text-xs text-stone-500">{r.itemCount}</td>
                    <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.netBill)}</td>
                  </tr>
                ))
              )}
            </ReportTable>
          </div>
        )}

        {/* ── Best Products Tab ── */}
        {!isLoading && activeTab === "products" && products.data && (
          <ReportTable headers={["Rank", "Product Name", "Units Sold", "No. of Orders", "Total Revenue"]}>
            {products.data.rows.length === 0 ? <EmptyRow cols={5} /> : (
              products.data.rows.map((r, i) => (
                <tr key={r.productId?.toString() || i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4">
                    <span className={`text-[11px] font-black ${i === 0 ? "text-amber-500" : i === 1 ? "text-stone-400" : i === 2 ? "text-amber-800" : "text-stone-300"}`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-stone-900">{r.productName}</td>
                  <td className="p-4 text-sm font-medium text-stone-600">{r.unitsSold}</td>
                  <td className="p-4 text-sm text-stone-500">{r.orderCount}</td>
                  <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.totalRevenue)}</td>
                </tr>
              ))
            )}
          </ReportTable>
        )}

        {/* ── Categories Tab ── */}
        {!isLoading && activeTab === "categories" && categories.data && (
          <ReportTable headers={["Sub-Category", "Units Sold", "No. of Orders", "Revenue", "% of Total"]}>
            {categories.data.rows.length === 0 ? <EmptyRow cols={5} /> : (
              categories.data.rows.map((r) => (
                <tr key={r.categoryName} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-stone-900">{r.categoryName}</td>
                  <td className="p-4 text-sm text-stone-600">{r.unitsSold}</td>
                  <td className="p-4 text-sm text-stone-500">{r.orderCount}</td>
                  <td className="p-4 text-sm font-bold text-amber-700">{fmtINR(r.totalRevenue)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden min-w-[60px]">
                        <div className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${r.percentOfTotal}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-stone-500 w-10 text-right shrink-0">
                        {r.percentOfTotal}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </ReportTable>
        )}
      </div>

      {/* Status hint */}
      {hasData && !isLoading && (
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium">
            Data computed by MongoDB aggregation pipeline for{" "}
            <strong>{fmtDate(dateFrom)}</strong> → <strong>{fmtDate(dateTo)}</strong>.{" "}
            Click <strong>Export This Report</strong> to download as Excel.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Shared components ──────────────────────────────────────────────────────────
const ReportTable = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-stone-50 border-b border-stone-200">
        <tr>{headers.map((h) => (
          <th key={h} className="p-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody className="divide-y divide-stone-100">{children}</tbody>
    </table>
  </div>
);

const EmptyRow = ({ cols }) => (
  <tr><td colSpan={cols} className="py-16 text-center text-stone-400 italic text-sm">No data for this period.</td></tr>
);

const STATUS_CLS = {
  pending:   "bg-amber-50 text-amber-700 border-amber-100",
  arriving:  "bg-blue-50 text-blue-700 border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${STATUS_CLS[status?.toLowerCase()] || "bg-stone-50 text-stone-500 border-stone-100"}`}>
    {status || "—"}
  </span>
);

export default Reports;