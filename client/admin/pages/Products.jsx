import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ImageIcon, IndianRupee, Package,
  Plus, Droplets, Trash2, Edit3, Search, Loader2, X, ToggleLeft, ToggleRight
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── Single axios instance with base URL & auth header injected automatically ──
// OLD: every call did axios.get("http://localhost:5000/api/...", { headers: { Authorization: `Bearer ${token}` } })
// NEW: one instance handles baseURL + token for ALL requests — change URL in one place, not 10
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Subcategory cache — lives OUTSIDE components so it survives re-renders ──
// OLD: modal fetched subcategories from server every single time it opened
// NEW: first fetch stores result here; every open after that is instant (no network call)
let subCategoryCache = null;

const LOW_STOCK_THRESHOLD = 200;

const Products = () => {
  const navigate = useNavigate();
  const [products,       setProducts]       = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [isModalOpen,    setIsModalOpen]    = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage,    setCurrentPage]    = useState(1);

  const ITEMS_PER_PAGE = 8;

  // ── useCallback: fetchProducts is now a stable function reference ──
  // OLD: fetchProducts was re-created on every render (new function object each time)
  // NEW: useCallback memoizes it — React won't recreate it unless dependencies change
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
  }, []); // empty deps = created once, forever stable

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── useMemo: filtered list is only recalculated when products or searchTerm changes ──
  // OLD: filteredProducts ran its .filter() loop on EVERY render (even unrelated state changes)
  // NEW: useMemo caches the result — re-runs only when products[] or searchTerm actually changes
  const filteredProducts = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return products; // no search? skip the loop entirely
    return products.filter((p) =>
      p.name?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s) ||
      p.materialType?.toLowerCase().includes(s) ||
      p.subCategoryId?.name?.toLowerCase().includes(s)
    );
  }, [products, searchTerm]);

  // ── Low stock count — used by the alert banner ──
  // useMemo so it only recomputes when products list changes, not on every render
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD),
    [products]
  );

  // ── Pagination logic ──
  // When user searches, reset to page 1 so they don't land on an empty page
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages   = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // useCallback on handlers so child components don't re-render from new function refs
  const openAddModal  = useCallback(() => { setEditingProduct(null); setIsModalOpen(true); }, []);
  const openEditModal = useCallback((p) => { setEditingProduct(p);   setIsModalOpen(true); }, []);
  const closeModal    = useCallback(() => setIsModalOpen(false), []);

  // ── Quick status toggle directly from the table row ──
  // NEW feature: admin can toggle active/inactive without opening the full edit modal
  const toggleStatus = useCallback(async (p) => {
    // Optimistic update: flip locally first for instant UI feedback
    // OLD pattern would refetch entire list from server after every change (slow)
    // NEW: update local state immediately, revert only if server call fails
    setProducts((prev) =>
      prev.map((item) => item._id === p._id ? { ...item, isActive: !item.isActive } : item)
    );
    try {
      await api.put(`/products/${p._id}`, { isActive: !p.isActive });
      toast.success(`${p.name} marked ${!p.isActive ? "Active" : "Inactive"}.`);
    } catch {
      // Revert on failure
      setProducts((prev) =>
        prev.map((item) => item._id === p._id ? { ...item, isActive: p.isActive } : item)
      );
      toast.error("Status update failed.");
    }
  }, []);

  const deleteProduct = useCallback((id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Disable <strong>{name}</strong>?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/products/${id}`);
                  // ── Optimistic delete: remove from local state, no refetch needed ──
                  // OLD: called fetchProducts() after delete = full server round trip
                  // NEW: just filter it out locally — server already deleted it
                  setProducts((prev) => prev.filter((p) => p._id !== id));
                  toast.success("Product disabled.");
                } catch {
                  toast.error("Disable failed.");
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
            >Confirm</button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
            >Cancel</button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  }, []);

  // ── Optimistic save: update local state instead of refetching from server ──
  // OLD: called fetchProducts() after every add/edit = extra network request every time
  // NEW: for edit → patch the item in state; for add → prepend to list. Zero extra API call.
  const saveProduct = useCallback(async (data) => {
    try {
      // ── Type coercion: convert string inputs to proper numbers before sending ──
      // OLD: form inputs are always strings ("450"), backend received wrong types
      // NEW: explicitly parse to Number so API always gets correct data types
      const payload = {
        ...data,
        isActive:    data.isActive === "active",
        price:       Number(data.price),
        pricePerBox: Number(data.pricePerBox),
        stock:       Number(data.stock),
        lengthMM:    Number(data.lengthMM),
        widthMM:     Number(data.widthMM),
        thicknessMM: data.thicknessMM ? Number(data.thicknessMM) : undefined,
      };

      if (data._id) {
        const res = await api.put(`/products/${data._id}`, payload);
        const updated = res.data.product;
        setProducts((prev) =>
          prev.map((p) => p._id === updated._id ? updated : p)
        );
        toast.success(`${data.name} updated successfully.`);
      } else {
        const res = await api.post("/products/create", payload);
        const created = res.data.product;
        // Prepend so new product appears at top of list
        setProducts((prev) => [created, ...prev]);
        toast.success(`${data.name} added to inventory.`);
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  }, [closeModal]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Inventory</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Manage material specifications and stock.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, SKU, or material..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} /> Add Material
          </button>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {/* Shows only when products are below 200 qty — clicking navigates to /admin/inventory */}
      {!isLoading && lowStockProducts.length > 0 && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Package size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {lowStockProducts.length} {lowStockProducts.length === 1 ? "product is" : "products are"} running low on stock
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {lowStockProducts.slice(0, 3).map((p) => p.name).join(", ")}
                {lowStockProducts.length > 3 && ` +${lowStockProducts.length - 3} more`}
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

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Syncing Database...</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Product Detail</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Technical Specs</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Pricing & Stock</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <ProductRow
                    key={p._id}
                    product={p}
                    onEdit={openEditModal}
                    onDelete={deleteProduct}
                    onToggleStatus={toggleStatus}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-stone-400 italic text-sm">
                    No materials match your parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination Bar ── */}
      {!isLoading && filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">

          {/* Left: showing X–Y of Z */}
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredProducts.length}</span>
            {" "}materials
          </p>

          {/* Right: page controls */}
          <div className="flex items-center gap-1">

            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>

            {/* Page number pills — smart windowing so it never gets too wide */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              )
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
                        : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          onClose={closeModal}
          onSave={saveProduct}
          product={editingProduct}
        />
      )}
    </div>
  );
};

// ── ProductRow extracted as its own component ──
// OLD: entire row JSX was inline inside the map() — every state change re-rendered ALL rows
// NEW: separate component + React.memo = only the changed row re-renders, rest are skipped
const ProductRow = React.memo(({ product: p, onEdit, onDelete, onToggleStatus }) => {
  // ── Resolve image: handle both array and string formats ──
  // OLD: p.image[0] || p.image[1] — breaks if image is a plain string (not array)
  // NEW: normalize to always get a usable string regardless of data shape
  const imageUrl = Array.isArray(p.image) ? p.image[0] : p.image;

  return (
    <tr className="hover:bg-stone-50/50 transition-colors group">
      <td className="p-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
            {imageUrl
              ? <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              : <ImageIcon size={20} className="text-stone-300" />}
          </div>
          <div>
            <span className="text-sm font-bold text-stone-900 block">{p.name}</span>
            <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase block mt-1">SKU: {p.sku}</span>
            <span className="text-[9px] text-stone-400 uppercase tracking-wide block mt-0.5">{p.subCategoryId?.name}</span>
          </div>
        </div>
      </td>
      <td className="p-5">
        <span className="text-xs font-bold text-stone-800 block uppercase tracking-tight">{p.materialType}</span>
        <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-1">
          <Droplets size={10} className="text-amber-600" /> {p.waterResistance}
        </span>
        {p.lengthMM && p.widthMM && (
          <span className="text-[9px] text-stone-400 block mt-1">{p.lengthMM} × {p.widthMM} mm</span>
        )}
      </td>
      <td className="p-5">
        <span className="text-sm font-bold text-stone-900 flex items-center gap-0.5">
          ₹{p.price?.toLocaleString("en-IN")}
          <span className="text-[9px] text-stone-400 font-bold uppercase ml-1 tracking-widest">/ {p.unit}</span>
        </span>
        {p.pricePerBox && (
          <span className="text-[10px] text-stone-500 block mt-0.5">
            ₹{p.pricePerBox?.toLocaleString("en-IN")} / box
          </span>
        )}
        <span className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mt-1 ${p.stock <= 10 ? "text-rose-500" : "text-emerald-600"}`}>
          <Package size={10} /> {p.stock} in stock
        </span>
      </td>
      <td className="p-5">
        {/* ── Quick toggle button directly in the row ── */}
        <button
          onClick={() => onToggleStatus(p)}
          className="flex items-center gap-1.5 group/toggle"
          title={p.isActive ? "Click to disable" : "Click to activate"}
        >
          {p.isActive
            ? <ToggleRight size={22} className="text-emerald-500 group-hover/toggle:text-emerald-600 transition-colors" />
            : <ToggleLeft  size={22} className="text-stone-300 group-hover/toggle:text-stone-400 transition-colors" />}
          <span className={`text-[9px] font-bold uppercase tracking-widest ${p.isActive ? "text-emerald-600" : "text-stone-400"}`}>
            {p.isActive ? "Active" : "Disabled"}
          </span>
        </button>
      </td>
      <td className="p-5">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(p)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all">
            <Edit3 size={16} />
          </button>
          <button onClick={() => onDelete(p._id, p.name)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});
ProductRow.displayName = "ProductRow";

// ── Validation rules ──────────────────────────────────────────────────────────
const VALIDATORS = {
  name:          (v, isEdit) => isEdit ? "" : (!v?.trim() ? "Required" : ""),
  sku:           (v, isEdit) => isEdit ? "" : (!v?.trim() ? "Required" : ""),
  materialType:  (v)         => !v?.trim() ? "Required" : "",
  subCategoryId: (v)         => !v ? "Required" : "",
  price:         (v)         => (!v || Number(v) <= 0) ? "Enter a valid price" : "",
  pricePerBox:   (v)         => (!v || Number(v) <= 0) ? "Enter a valid price per box" : "",
  stock:         (v)         => (v === "" || Number(v) < 0) ? "Enter a valid stock value" : "",
  lengthMM:      (v)         => (!v || Number(v) <= 0) ? "Enter a valid length" : "",
  widthMM:       (v)         => (!v || Number(v) <= 0) ? "Enter a valid width" : "",
  image:         (v)         => !v?.trim() ? "Required" : !v.startsWith("http") ? "Must be a valid URL" : "",
};

const EMPTY_FORM = {
  name: "", sku: "", description: "", image: "",
  price: "", pricePerBox: "", unit: "sqft", stock: "",
  materialType: "", woodType: "", color: "", colorFamily: "", finish: "",
  thicknessMM: "", lengthMM: "", widthMM: "",
  waterResistance: "Not-resistant",
  subCategoryId: "", isActive: "active",
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const ProductModal = ({ onClose, onSave, product }) => {
  const isEdit = !!product;

  const [subCategories, setSubCategories] = useState(subCategoryCache || []);
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});
  const [isSaving,      setIsSaving]      = useState(false);

  const [formData, setFormData] = useState(() =>
    // ── Lazy initializer: useState(() => fn) runs the function only ONCE ──
    // OLD: useState(product ? {...} : {...}) — object was computed on every render
    // NEW: lazy init fn runs once when modal mounts, never again
    product
      ? {
          ...product,
          subCategoryId: product.subCategoryId?._id || product.subCategoryId,
          isActive:      product.isActive ? "active" : "inactive",
        }
      : { ...EMPTY_FORM }
  );

  useEffect(() => {
    // ── Cache check: skip network call if we already have subcategories ──
    // OLD: axios.get("/subcategories") ran every time the modal opened
    // NEW: if subCategoryCache is populated, use it directly — no API call at all
    if (subCategoryCache) return;
    const fetchCats = async () => {
      try {
        const res = await api.get("/subcategories");
        subCategoryCache = res.data.subCategories; // store in module-level cache
        setSubCategories(res.data.subCategories);
      } catch {
        toast.error("Failed to load categories.");
      }
    };
    fetchCats();
  }, []);

  const set = useCallback((key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = VALIDATORS[key] ? VALIDATORS[key](val, isEdit) : "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, [isEdit]);

  // ── Fixed blur logic ──
  // OLD: `if (touched[key]) return` — skipped validation if already touched (wrong!)
  // NEW: blur should ALWAYS validate, regardless of whether field was already touched
  const handleBlur = useCallback((key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = VALIDATORS[key] ? VALIDATORS[key](formData[key], isEdit) : "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, [formData, isEdit]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const allTouched = {};
    const newErrors  = {};
    Object.keys(VALIDATORS).forEach((key) => {
      allTouched[key] = true;
      const msg = VALIDATORS[key](formData[key], isEdit);
      if (msg) newErrors[key] = msg;
    });
    setTouched(allTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields correctly.");
      const firstKey = Object.keys(VALIDATORS).find((k) => newErrors[k]);
      if (firstKey) {
        document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const fieldCls = useCallback((key, extra = "") => {
    const hasErr     = touched[key] && errors[key];
    const hasSuccess = touched[key] && !errors[key] && formData[key] !== "" && formData[key] !== undefined;
    return [
      "w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none transition-all",
      extra,
      hasErr     ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
      : hasSuccess ? "border-emerald-400 ring-2 ring-emerald-50"
      : "border-stone-200 focus:border-amber-500",
    ].join(" ");
  }, [touched, errors, formData]);

  const FieldMsg = useCallback(({ fieldKey }) => {
    if (!touched[fieldKey]) return null;
    if (errors[fieldKey]) return (
      <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
        <span>!</span> {errors[fieldKey]}
      </p>
    );
    if (formData[fieldKey] !== "" && formData[fieldKey] !== undefined) return (
      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
        <span>✓</span> Looks good
      </p>
    );
    return null;
  }, [touched, errors, formData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-50 rounded-[2rem] w-full max-w-5xl shadow-2xl border border-stone-200 overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {isEdit ? "Edit Specifications" : "New Material Entry"}
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Architectural Database</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">

          {/* Section 1 */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">
              1. Identification & Media
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1" data-field="name">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      Material Name {!isEdit && <span className="text-red-400">*</span>}
                    </label>
                    <input type="text" className={fieldCls("name")} value={formData.name}
                      onChange={(e) => set("name", e.target.value)} onBlur={() => handleBlur("name")} disabled={isEdit} />
                    {!isEdit && <FieldMsg fieldKey="name" />}
                  </div>
                  <div className="space-y-1" data-field="sku">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      SKU Code {!isEdit && <span className="text-red-400">*</span>}
                    </label>
                    <input type="text" className={fieldCls("sku", "font-mono uppercase")} value={formData.sku}
                      onChange={(e) => set("sku", e.target.value.toUpperCase())} onBlur={() => handleBlur("sku")} disabled={isEdit} />
                    {!isEdit && <FieldMsg fieldKey="sku" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1" data-field="subCategoryId">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      Sub-Category <span className="text-red-400">*</span>
                    </label>
                    <select className={fieldCls("subCategoryId")} value={formData.subCategoryId}
                      onChange={(e) => set("subCategoryId", e.target.value)} onBlur={() => handleBlur("subCategoryId")}>
                      <option value="">Select Category</option>
                      {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <FieldMsg fieldKey="subCategoryId" />
                  </div>
                  <div className="space-y-1" data-field="materialType">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      Material Family <span className="text-red-400">*</span>
                    </label>
                    <input type="text" placeholder="e.g. Hardwood, Vinyl" className={fieldCls("materialType")} value={formData.materialType}
                      onChange={(e) => set("materialType", e.target.value)} onBlur={() => handleBlur("materialType")} />
                    <FieldMsg fieldKey="materialType" />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-1" data-field="image">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Primary Image URL <span className="text-red-400">*</span>
                </label>
                <input type="text" className={fieldCls("image")} placeholder="https://..."
                  value={formData.image} onChange={(e) => set("image", e.target.value)} onBlur={() => handleBlur("image")} />
                <FieldMsg fieldKey="image" />
                <div className="h-24 w-full mt-1 rounded-xl border border-stone-200 bg-white flex items-center justify-center overflow-hidden">
                  {formData.image && !errors.image
                    ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    : <ImageIcon size={24} className="text-stone-300" />}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">
              2. Financials & Inventory
            </h3>
            {/* ── Fixed grid: was md:grid-cols-5 with only 4 items — broken layout ── */}
            {/* NEW: md:grid-cols-4 so each field gets equal space cleanly */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1" data-field="price">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input type="number" className={fieldCls("price", "pl-8")} value={formData.price}
                    onChange={(e) => set("price", e.target.value)} onBlur={() => handleBlur("price")} />
                </div>
                <FieldMsg fieldKey="price" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Base Unit</label>
                <select className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  value={formData.unit} onChange={(e) => set("unit", e.target.value)}>
                  <option value="sqft">Sq. Ft.</option>
                  <option value="box">Box</option>
                  <option value="plank">Plank</option>
                </select>
              </div>

              <div className="space-y-1" data-field="pricePerBox">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Price / Box <span className="text-red-400">*</span>
                </label>
                <input type="number" className={fieldCls("pricePerBox")} value={formData.pricePerBox}
                  onChange={(e) => set("pricePerBox", e.target.value)} onBlur={() => handleBlur("pricePerBox")} />
                <FieldMsg fieldKey="pricePerBox" />
              </div>

              <div className="space-y-1" data-field="stock">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Current Stock <span className="text-red-400">*</span>
                </label>
                <input type="number" className={fieldCls("stock")} value={formData.stock}
                  onChange={(e) => set("stock", e.target.value)} onBlur={() => handleBlur("stock")} />
                <FieldMsg fieldKey="stock" />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">
              3. Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { key: "woodType", label: "Wood Species" },
                { key: "color",    label: "Specific Color" },
                { key: "finish",   label: "Surface Finish", placeholder: "e.g. Matte" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">{label}</label>
                  <input type="text" placeholder={placeholder}
                    className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    value={formData[key]} onChange={(e) => set(key, e.target.value)} />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Color Family</label>
                <select className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  value={formData.colorFamily} onChange={(e) => set("colorFamily", e.target.value)}>
                  <option value="">Select...</option>
                  {["Light","Medium","Dark","Gray","Natural","White"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Thickness (mm)</label>
                <input type="number" className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  value={formData.thicknessMM} onChange={(e) => set("thicknessMM", e.target.value)} />
              </div>

              <div className="space-y-1" data-field="lengthMM">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Length (mm) <span className="text-red-400">*</span>
                </label>
                <input type="number" className={fieldCls("lengthMM")} value={formData.lengthMM}
                  onChange={(e) => set("lengthMM", e.target.value)} onBlur={() => handleBlur("lengthMM")} />
                <FieldMsg fieldKey="lengthMM" />
              </div>

              <div className="space-y-1" data-field="widthMM">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Width (mm) <span className="text-red-400">*</span>
                </label>
                <input type="number" className={fieldCls("widthMM")} value={formData.widthMM}
                  onChange={(e) => set("widthMM", e.target.value)} onBlur={() => handleBlur("widthMM")} />
                <FieldMsg fieldKey="widthMM" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Water Resistance</label>
                <select className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  value={formData.waterResistance} onChange={(e) => set("waterResistance", e.target.value)}>
                  <option value="Not-resistant">Not-resistant</option>
                  <option value="Water-resistant">Water-resistant</option>
                  <option value="Waterproof">Waterproof</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">
              4. Visibility & Description
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Rich Description</label>
                <textarea className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm h-24 resize-none outline-none focus:border-amber-500 transition-all shadow-inner"
                  value={formData.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Catalog Status</label>
                <select className="w-full bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  value={formData.isActive} onChange={(e) => set("isActive", e.target.value)}>
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Disabled (Hidden)</option>
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-200 bg-white flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="px-6 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEdit ? "Commit Update" : "Log Material"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;