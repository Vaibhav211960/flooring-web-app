import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Package, Search, Loader2, AlertTriangle,
  CheckCircle2, Save, RotateCcw, ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── Same shared axios instance ──
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const LOW_STOCK_THRESHOLD = 200;

// onNavigate prop — to go back to products page via sidebar
const Inventory = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ── pendingUpdates: tracks which stock fields the admin has edited ──
  // key = product._id, value = new stock number they typed
  // This way only changed rows get saved — not the entire list
  const [pendingUpdates, setPendingUpdates] = useState({});

  // ── savingIds: tracks which rows are currently mid-save ──
  // so we can show a spinner on just that row's button
  const [savingIds, setSavingIds] = useState(new Set());

  const ITEMS_PER_PAGE = 10;

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/products");
      setProducts(res.data.products);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Only show products below threshold ──
  // useMemo: recomputes only when products or searchTerm changes
  const lowStockProducts = useMemo(() => {
    const all = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
    const s   = searchTerm.toLowerCase();
    if (!s) return all;
    return all.filter((p) =>
      p.name?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s) ||
      p.subCategoryId?.name?.toLowerCase().includes(s)
    );
  }, [products, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(lowStockProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return lowStockProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [lowStockProducts, currentPage]);

  // ── Handle stock input change — just stores in pendingUpdates, doesn't save yet ──
  // This is important: we don't call the API on every keystroke
  // Admin types a number → it's held locally → they click Save on that row
  const handleStockChange = useCallback((productId, value) => {
    setPendingUpdates((prev) => ({ ...prev, [productId]: value }));
  }, []);

  // ── Discard changes for one row ──
  const handleDiscard = useCallback((productId) => {
    setPendingUpdates((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  // ── Save stock for a single product ──
  const handleSave = useCallback(async (product) => {
    const newStock = Number(pendingUpdates[product._id]);

    if (isNaN(newStock) || newStock < 0) {
      toast.error("Please enter a valid stock number.");
      return;
    }

    // Mark this row as saving
    setSavingIds((prev) => new Set(prev).add(product._id));

    try {
      await api.put(`/products/${product._id}`, { stock: newStock });

      // ── Optimistic update: patch the product in local state ──
      // No full refetch — just update the one product's stock value
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, stock: newStock } : p)
      );

      // Clear that row's pending change
      setPendingUpdates((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });

      toast.success(`${product.name} stock updated to ${newStock}.`);
    } catch {
      toast.error("Failed to update stock.");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }
  }, [pendingUpdates]);

  // ── Urgency level for the stock badge ──
  const getUrgency = (stock) => {
    if (stock <= 20)  return { label: "Critical",  cls: "bg-red-50 text-red-600 border-red-100" };
    if (stock <= 80)  return { label: "Very Low",  cls: "bg-orange-50 text-orange-600 border-orange-100" };
    return               { label: "Low",       cls: "bg-amber-50 text-amber-600 border-amber-100" };
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* Back button — uses React Router to go back to /admin/products */}
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-1 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
            title="Back to Products"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">Inventory Management</h1>
            <p className="text-sm text-stone-500 mt-1 font-medium italic">
              Products with stock at or below {LOW_STOCK_THRESHOLD} units.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary pill */}
          {!isLoading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                {lowStockProducts.length} low stock {lowStockProducts.length === 1 ? "item" : "items"}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-56 gap-4">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading Inventory...</p>
          </div>

        ) : lowStockProducts.length === 0 ? (
          /* ── All good state — nothing is low ── */
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-stone-700">All stock levels look good!</p>
            <p className="text-xs text-stone-400 italic">
              {searchTerm ? "No low-stock products match your search." : "No products are below 200 units."}
            </p>
          </div>

        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Product</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Category</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Current Stock</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Update Stock</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedProducts.map((p) => {
                const urgency    = getUrgency(p.stock);
                const isDirty    = pendingUpdates[p._id] !== undefined;
                const isSaving   = savingIds.has(p._id);
                const inputValue = isDirty ? pendingUpdates[p._id] : p.stock;

                return (
                  <tr key={p._id} className={`transition-colors ${isDirty ? "bg-amber-50/40" : "hover:bg-stone-50/50"}`}>

                    {/* Product info */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                          {p.image
                            ? <img
                                src={Array.isArray(p.image) ? p.image[0] : p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            : <Package size={14} className="text-stone-300" />}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-stone-900 block">{p.name}</span>
                          <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase">
                            {p.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-5">
                      <span className="text-xs font-medium text-stone-600">
                        {p.subCategoryId?.name || "—"}
                      </span>
                    </td>

                    {/* Current stock with urgency badge */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{p.stock}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${urgency.cls}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">/ {p.unit}</span>
                    </td>

                    {/* Editable stock input */}
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={inputValue}
                          onChange={(e) => handleStockChange(p._id, e.target.value)}
                          className={`w-28 px-3 py-2 text-sm font-bold rounded-xl border outline-none transition-all ${
                            isDirty
                              ? "border-amber-400 ring-2 ring-amber-50 bg-white text-stone-900"
                              : "border-stone-200 bg-stone-50 text-stone-500 focus:border-amber-400 focus:bg-white"
                          }`}
                        />
                        {/* Discard button — only shows when row has unsaved changes */}
                        {isDirty && (
                          <button
                            onClick={() => handleDiscard(p._id)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
                            title="Discard change"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                      {isDirty && (
                        <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                          ● Unsaved change
                        </p>
                      )}
                    </td>

                    {/* Save button */}
                    <td className="p-5">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(p)}
                          disabled={!isDirty || isSaving}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            isDirty && !isSaving
                              ? "bg-stone-900 text-amber-400 hover:bg-stone-800 shadow-md active:scale-95"
                              : "bg-stone-100 text-stone-300 cursor-not-allowed"
                          }`}
                        >
                          {isSaving
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Save size={12} />}
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && lowStockProducts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, lowStockProducts.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{lowStockProducts.length}</span>
            {" "}low-stock items
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) acc.push("gap-" + page);
                acc.push(page);
                return acc;
              }, [])
              .map((item) =>
                typeof item === "string" ? (
                  <span key={item} className="px-1.5 text-stone-300 text-xs select-none">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-bold transition-all border ${
                      currentPage === item
                        ? "bg-stone-900 text-amber-400 border-stone-900 shadow-md"
                        : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                    }`}
                  >{item}</button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;