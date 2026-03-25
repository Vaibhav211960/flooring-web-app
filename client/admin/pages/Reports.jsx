import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet,
  Download,
  Loader2,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Package,
  Layers,
  Users,
  CreditCard,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const REPORT_ENDPOINTS = {
  revenue: "/orders/admin/reports/revenue",
  orders: "/orders/admin/reports/orders",
  products: "/orders/admin/reports/products",
  categories: "/orders/admin/reports/categories",
  customers: "/orders/admin/reports/customers",
  payments: "/orders/admin/reports/payments",
  orderSize: "/orders/admin/reports/order-size",
};

const TABS = [
  { key: "revenue", label: "Revenue", icon: TrendingUp },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "products", label: "Best Products", icon: Package },
  { key: "categories", label: "By Category", icon: Layers },
  { key: "customers", label: "Customers", icon: Users },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "orderSize", label: "Order Size", icon: Boxes },
];

const tabKeys = TABS.map((t) => t.key);

let _XLSX = null;
const getXLSX = () =>
  _XLSX
    ? Promise.resolve(_XLSX)
    : new Promise((resolve, reject) => {
        if (window.XLSX) {
          _XLSX = window.XLSX;
          resolve(_XLSX);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = () => {
          _XLSX = window.XLSX;
          resolve(_XLSX);
        };
        script.onerror = () => reject(new Error("Failed to load SheetJS"));
        document.head.appendChild(script);
      });

let _PDF = null;
const getPDFTools = () =>
  _PDF
    ? Promise.resolve(_PDF)
    : Promise.all([import("jspdf"), import("jspdf-autotable")]).then(([jspdfModule, autoTableModule]) => {
        _PDF = {
          jsPDF: jspdfModule.jsPDF || jspdfModule.default,
          autoTable: autoTableModule.default || autoTableModule.autoTable,
        };
        return _PDF;
      });

const toDateStr = (d) => d.toISOString().split("T")[0];
const today = new Date();
const DEFAULT_FROM = toDateStr(new Date(today.getFullYear(), today.getMonth(), 1));
const DEFAULT_TO = toDateStr(today);
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
const fmtINR = (n) => `${Number(n || 0).toLocaleString("en-IN")}`;

const initReportState = () =>
  tabKeys.reduce((acc, key) => {
    acc[key] = { data: null, isLoading: false };
    return acc;
  }, {});

const getValue = (value, type, key) => {
  if (value === null || value === undefined || value === "") return "-";
  if (key === "_id") return `#${String(value).slice(-8).toUpperCase()}`;
  if (type === "currency") return fmtINR(value);
  if (type === "date") return fmtDate(value);
  if (type === "percent") return `${value}%`;
  return String(value);
};

const toQueryParams = ({ from, to, fields, filters }) => {
  const params = { from, to };
  if (Array.isArray(fields) && fields.length) params.fields = fields.join(",");
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === "" || v === undefined || v === null) return;
    params[k] = typeof v === "boolean" ? String(v) : v;
  });
  return params;
};

const Reports = () => {
  const [dateFrom, setDateFrom] = useState(DEFAULT_FROM);
  const [dateTo, setDateTo] = useState(DEFAULT_TO);
  const [activeTab, setActiveTab] = useState("revenue");
  const [reportState, setReportState] = useState(initReportState());
  const [reportConfig, setReportConfig] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [filters, setFilters] = useState({});

  const loadConfig = useCallback(async () => {
    try {
      const res = await api.get("/orders/admin/reports/config");
      const cfg = res.data?.reports || {};
      setReportConfig(cfg);

      const defaultFields = {};
      const defaultFilters = {};
      tabKeys.forEach((key) => {
        defaultFields[key] = cfg[key]?.defaultFields || [];
        defaultFilters[key] = {};
      });
      setSelectedFields(defaultFields);
      setFilters(defaultFilters);
    } catch {
      toast.error("Failed to load dynamic report config.");
    }
  }, []);

  const fetchReport = useCallback(
    async (tab, from = dateFrom, to = dateTo, override = {}) => {
      const fields = override.fields || selectedFields[tab] || reportConfig?.[tab]?.defaultFields || [];
      const tabFilters = override.filters || filters[tab] || {};

      setReportState((prev) => ({ ...prev, [tab]: { ...prev[tab], isLoading: true } }));
      try {
        const res = await api.get(REPORT_ENDPOINTS[tab], {
          params: toQueryParams({ from, to, fields, filters: tabFilters }),
        });
        setReportState((prev) => ({ ...prev, [tab]: { data: res.data, isLoading: false } }));
        return res.data;
      } catch {
        setReportState((prev) => ({ ...prev, [tab]: { ...prev[tab], isLoading: false } }));
        toast.error(`Failed to load ${tab} report.`);
        return null;
      }
    },
    [dateFrom, dateTo, selectedFields, filters, reportConfig]
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (!reportConfig) return;
    fetchReport("revenue", DEFAULT_FROM, DEFAULT_TO);
  }, [reportConfig, fetchReport]);

  const activeState = reportState[activeTab] || { data: null, isLoading: false };
  const activeData = activeState.data;
  const activeRows = activeData?.rows || [];
  const activeFields = selectedFields[activeTab] || [];
  const activeFieldDefs = reportConfig?.[activeTab]?.fields || [];
  const activeFilters = reportConfig?.[activeTab]?.filters || [];

  const headerDefs = useMemo(() => {
    const map = Object.fromEntries(activeFieldDefs.map((f) => [f.key, f]));
    return activeFields.map((key) => map[key]).filter(Boolean);
  }, [activeFieldDefs, activeFields]);

  const handleDateChange = useCallback(
    (from, to) => {
      setDateFrom(from);
      setDateTo(to);
      setReportState(initReportState());
      fetchReport(activeTab, from, to);
    },
    [activeTab, fetchReport]
  );

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields((prev) => {
      const prevList = prev[activeTab] || [];
      const exists = prevList.includes(fieldKey);
      const nextList = exists ? prevList.filter((f) => f !== fieldKey) : [...prevList, fieldKey];
      return { ...prev, [activeTab]: nextList };
    });
  };

  const handleFilterInput = (key, value) => {
    setFilters((prev) => ({ ...prev, [activeTab]: { ...(prev[activeTab] || {}), [key]: value } }));
  };

  const applyDynamicConfig = () => {
    const currentFields = selectedFields[activeTab] || [];
    if (!currentFields.length) {
      toast.error("Select at least one field.");
      return;
    }
    fetchReport(activeTab);
  };

  const periodLabel = `${fmtDate(dateFrom)} to ${fmtDate(dateTo)}`;

  const buildExportRows = (rows, fieldsForTab, fieldDefs) => {
    const map = Object.fromEntries(fieldDefs.map((f) => [f.key, f]));
    const headers = fieldsForTab.map((k) => map[k]?.label || k);
    const matrix = rows.map((row) =>
      fieldsForTab.map((key) => getValue(row[key], map[key]?.type, key))
    );
    return { headers, matrix };
  };

  const exportCurrent = useCallback(
    async (pdfOnly = false) => {
      if (!activeRows.length || !headerDefs.length) {
        toast.error("No data to export.");
        return;
      }

      const { headers, matrix } = buildExportRows(activeRows, activeFields, activeFieldDefs);
      const fileBase = `${activeTab}_report_${dateFrom}_to_${dateTo}`;

      if (!pdfOnly) {
        await getXLSX();
        const XLSX = window.XLSX;
        const ws = XLSX.utils.aoa_to_sheet([headers, ...matrix]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, activeTab);
        XLSX.writeFile(wb, `${fileBase}.xlsx`);
      }

      const { jsPDF, autoTable } = await getPDFTools();
      const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait" });
      doc.setFontSize(14);
      doc.text(`${activeTab.toUpperCase()} REPORT`, 14, 16);
      doc.setFontSize(9);
      doc.text(`Period: ${periodLabel}`, 14, 22);
      autoTable(doc, {
        startY: 28,
        head: [headers],
        body: matrix,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [28, 25, 23], textColor: [251, 191, 36] },
      });
      doc.save(`${fileBase}.pdf`);

      toast.success(pdfOnly ? "PDF downloaded." : "Excel and PDF downloaded.");
    },
    [activeRows, headerDefs, activeFields, activeFieldDefs, activeTab, dateFrom, dateTo, periodLabel]
  );

  const exportAll = useCallback(
    async (pdfOnly = false) => {
      if (!reportConfig) return;
      toast.loading("Preparing all reports...", { id: "all-reports" });
      const payloadByTab = {};
      for (const tab of tabKeys) {
        payloadByTab[tab] = await fetchReport(tab);
      }

      for (const tab of tabKeys) {
        const data = payloadByTab[tab];
        const fieldsForTab = selectedFields[tab] || reportConfig[tab]?.defaultFields || [];
        const fieldDefs = reportConfig[tab]?.fields || [];
        if (!data?.rows?.length || !fieldsForTab.length) continue;

        const { headers, matrix } = buildExportRows(data.rows, fieldsForTab, fieldDefs);
        const fileBase = `${tab}_report_${dateFrom}_to_${dateTo}`;

        if (!pdfOnly) {
          await getXLSX();
          const XLSX = window.XLSX;
          const ws = XLSX.utils.aoa_to_sheet([headers, ...matrix]);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, tab);
          XLSX.writeFile(wb, `${fileBase}.xlsx`);
        }

        const { jsPDF, autoTable } = await getPDFTools();
        const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait" });
        doc.setFontSize(14);
        doc.text(`${tab.toUpperCase()} REPORT`, 14, 16);
        doc.setFontSize(9);
        doc.text(`Period: ${periodLabel}`, 14, 22);
        autoTable(doc, {
          startY: 28,
          head: [headers],
          body: matrix,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [28, 25, 23], textColor: [251, 191, 36] },
        });
        doc.save(`${fileBase}.pdf`);
      }

      toast.success("All reports exported.", { id: "all-reports" });
    },
    [reportConfig, fetchReport, selectedFields, dateFrom, dateTo, periodLabel]
  );

  const getSummaryCards = () => {
    if (!activeData) return [];
    if (activeTab === "revenue") {
      return [
        { label: "Total Revenue", value: fmtINR(activeData.summary?.totalRevenue) },
        { label: "Total Orders", value: activeData.summary?.totalOrders || 0 },
        { label: "Avg Order Value", value: fmtINR(activeData.summary?.avgOrderValue) },
      ];
    }
    if (activeTab === "orders") {
      return Object.entries(activeData.byStatus || {}).map(([k, v]) => ({ label: k, value: v }));
    }
    if (activeTab === "customers") {
      return [
        { label: "Customers", value: activeData.summary?.totalCustomers || 0 },
        { label: "Repeat Customers", value: activeData.summary?.repeatCustomers || 0 },
        { label: "Revenue", value: fmtINR(activeData.summary?.totalRevenue) },
      ];
    }
    if (activeTab === "payments" || activeTab === "orderSize") {
      return [
        { label: "Total Orders", value: activeData.summary?.totalOrders || 0 },
        { label: "Total Revenue", value: fmtINR(activeData.summary?.totalRevenue) },
      ];
    }
    if (activeTab === "categories") {
      return [{ label: "Revenue", value: fmtINR(activeData.grandTotal || 0) }];
    }
    return [{ label: "Rows", value: activeRows.length }];
  };

  const summaryCards = getSummaryCards();

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-stone-900">Reports</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportAll(false)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700">
            <Download size={12} className="inline mr-1" /> Download All Reports
          </button>
          <button onClick={() => exportAll(true)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700">
            <Download size={12} className="inline mr-1" /> Download All PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-sm">
        <Calendar size={15} className="text-amber-600 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Date Range</span>
        <input type="date" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50" />
        <input type="date" value={dateTo} min={dateFrom} max={toDateStr(today)} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50" />
        <button onClick={() => handleDateChange(dateFrom, dateTo)} className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-700">
          <RefreshCw size={12} /> Apply
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-stone-100 rounded-xl">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (!reportState[key]?.data && reportConfig) fetchReport(key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === key ? "bg-white text-stone-900 shadow-sm border border-stone-200" : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportCurrent(false)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
            <FileSpreadsheet size={13} /> Export This Report
          </button>
          <button onClick={() => exportCurrent(true)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-stone-600 text-xs font-bold uppercase tracking-widest">
          <SlidersHorizontal size={14} /> Dynamic Fields & Filters
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-stone-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Choose Fields</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {activeFieldDefs.map((field) => (
                <label key={field.key} className="flex items-center gap-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={(activeFields || []).includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>

          <div className="border border-stone-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Filters</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {activeFilters.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase tracking-widest text-stone-400">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      value={filters[activeTab]?.[f.key] || ""}
                      onChange={(e) => handleFilterInput(f.key, e.target.value)}
                      className="w-full mt-1 px-2 py-2 border border-stone-200 rounded-lg text-sm"
                    >
                      <option value="">All</option>
                      {(f.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : f.type === "boolean" ? (
                    <select
                      value={String(filters[activeTab]?.[f.key] ?? "")}
                      onChange={(e) => handleFilterInput(f.key, e.target.value === "" ? "" : e.target.value === "true")}
                      className="w-full mt-1 px-2 py-2 border border-stone-200 rounded-lg text-sm"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={filters[activeTab]?.[f.key] || ""}
                      onChange={(e) => handleFilterInput(f.key, e.target.value)}
                      className="w-full mt-1 px-2 py-2 border border-stone-200 rounded-lg text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={applyDynamicConfig} className="px-4 py-2 rounded-xl bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-700">
          Generate Dynamic Report
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
        {activeState.isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Running pipeline...</p>
          </div>
        )}

        {!activeState.isLoading && !activeData && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle size={28} className="text-stone-200" />
            <p className="text-sm text-stone-400 italic">No data for this period.</p>
          </div>
        )}

        {!activeState.isLoading && activeData && (
          <div>
            {summaryCards.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-stone-100">
                {summaryCards.map((card) => (
                  <div key={card.label} className="bg-white px-6 py-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{card.label}</p>
                    <p className="text-2xl font-bold font-serif text-stone-900 mt-1">{card.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {headerDefs.map((h) => (
                      <th key={h.key} className="p-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeRows.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(headerDefs.length, 1)} className="py-16 text-center text-stone-400 italic text-sm">
                        No data for this period.
                      </td>
                    </tr>
                  ) : (
                    activeRows.map((row, idx) => (
                      <tr key={`${activeTab}-${idx}`} className="hover:bg-stone-50/50 transition-colors">
                        {headerDefs.map((h) => (
                          <td key={h.key} className="p-4 text-sm text-stone-700">
                            {getValue(row[h.key], h.type, h.key)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {!!activeData && !activeState.isLoading && (
        <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium">
            Dynamic report generated for <strong>{fmtDate(dateFrom)}</strong> to <strong>{fmtDate(dateTo)}</strong> using selected fields and filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
