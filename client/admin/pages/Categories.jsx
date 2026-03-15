import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, ImageIcon, AlignLeft, Globe, Loader2, X, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "react-hot-toast";

// ── Single axios instance — same pattern as Products.jsx ──
// FIX: Categories was using "adminToken" but Products uses "token" — unified here to "token"
// OLD: every call repeated the full URL + token header manually
// NEW: one instance, one interceptor, zero repetition
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ← unified key
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Module-level cache so CategoryModal never refetches on second open ──
// (reused by SubCategories modal too if they share the same bundle)
export let categoryCache = null;

const ITEMS_PER_PAGE = 8;

const Categories = () => {
  const [categories,      setCategories]      = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [currentPage,     setCurrentPage]     = useState(1);

  // ── useCallback: stable reference, created once ──
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.categories);
      // Keep module cache in sync so modals benefit too
      categoryCache = res.data.categories;
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── useMemo: search filter only recomputes when data or term changes ──
  const filteredCategories = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return categories;
    return categories.filter((c) =>
      c.name?.toLowerCase().includes(s) ||
      c.description?.toLowerCase().includes(s)
    );
  }, [categories, searchTerm]);

  // Reset to page 1 whenever search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));

  // ── useMemo: page slice only recomputes when filter or page changes ──
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const openAddModal  = useCallback(() => { setEditingCategory(null); setIsModalOpen(true); }, []);
  const openEditModal = useCallback((cat) => { setEditingCategory(cat); setIsModalOpen(true); }, []);
  const closeModal    = useCallback(() => setIsModalOpen(false), []);

  // ── Quick status toggle directly from the table ──
  // NEW: admin can flip active/inactive without opening the modal
  const toggleStatus = useCallback(async (cat) => {
    // Optimistic update first — UI feels instant
    setCategories((prev) =>
      prev.map((c) => c._id === cat._id ? { ...c, isActive: !cat.isActive } : c)
    );
    try {
      await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      toast.success(`${cat.name} marked ${!cat.isActive ? "Active" : "Inactive"}.`);
    } catch {
      // Revert if server call fails
      setCategories((prev) =>
        prev.map((c) => c._id === cat._id ? { ...c, isActive: cat.isActive } : c)
      );
      toast.error("Status update failed.");
    }
  }, []);

  const deleteCategory = useCallback((id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">
            Remove <strong>{name}</strong> from the registry?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/categories/${id}`);
                  // ── Optimistic delete: filter locally, no refetch ──
                  setCategories((prev) => prev.filter((c) => c._id !== id));
                  toast.success("Collection removed.");
                } catch {
                  toast.error("Delete failed.");
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

  // ── Optimistic save: no refetch needed ──
  // OLD: fetchCategories() after every save = full server round trip
  // NEW: edit patches the item in state; add prepends to list
  const saveCategory = useCallback(async (data) => {
    try {
      const payload = {
        name:        data.name,
        description: data.description,
        image:       data.imageUrl,
        // FIX: was sending data.isActive raw ("active"/"inactive" string)
        // NEW: normalize to boolean so backend always gets the right type
        isActive:    data.isActive !== "inactive",
      };

      if (data._id) {
        const res = await api.put(`/categories/${data._id}`, payload);
        const updated = res.data.category;
        setCategories((prev) =>
          prev.map((c) => c._id === updated._id ? updated : c)
        );
        categoryCache = null; // invalidate so next modal open gets fresh data
        toast.success("Collection updated successfully.");
      } else {
        const res = await api.post("/categories/create", payload);
        const created = res.data.category;
        setCategories((prev) => [created, ...prev]);
        categoryCache = null;
        toast.success("New collection created.");
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  }, [closeModal]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Material Collections</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Define and organize your core flooring categories.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search collections..."
              className="pl-4 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} /> New Collection
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading Collections...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-stone-400 italic text-sm">
            {searchTerm ? "No collections match your search." : "No collections found. Create your first one."}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Preview</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Collection Details</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Route</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedCategories.map((cat) => (
                <CategoryRow
                  key={cat._id}
                  category={cat}
                  onEdit={openEditModal}
                  onDelete={deleteCategory}
                  onToggleStatus={toggleStatus}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination Bar ── */}
      {!isLoading && filteredCategories.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredCategories.length}</span>
            {" "}collections
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-white hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >Next →</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          onClose={closeModal}
          onSave={saveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
};

// ── CategoryRow as its own memoized component ──
// OLD: all rows re-rendered on any state change
// NEW: React.memo means only the changed row re-renders
const CategoryRow = React.memo(({ category: cat, onEdit, onDelete, onToggleStatus }) => (
  <tr className="hover:bg-stone-50/50 transition-colors group">
    <td className="p-5">
      <div className="h-12 w-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
        {cat.image
          ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
          : <ImageIcon size={16} className="text-stone-300" />}
      </div>
    </td>
    <td className="p-5">
      <span className="text-sm font-bold text-stone-900 block">{cat.name}</span>
      <p className="text-[11px] text-stone-400 italic line-clamp-1 mt-0.5">
        {cat.description || "No description provided."}
      </p>
    </td>
    <td className="p-5 font-mono text-[10px] text-stone-500 italic">
      /{cat.name?.toLowerCase().replace(/ /g, "-")}
    </td>
    <td className="p-5">
      {/* ── Quick toggle in table row — no modal needed ── */}
      <button
        onClick={() => onToggleStatus(cat)}
        className="flex items-center gap-1.5 group/toggle"
        title={cat.isActive ? "Click to disable" : "Click to activate"}
      >
        {cat.isActive
          ? <ToggleRight size={22} className="text-emerald-500 group-hover/toggle:text-emerald-600 transition-colors" />
          : <ToggleLeft  size={22} className="text-stone-300 group-hover/toggle:text-stone-400 transition-colors" />}
        <span className={`text-[9px] font-bold uppercase tracking-widest ${cat.isActive ? "text-emerald-600" : "text-stone-400"}`}>
          {cat.isActive ? "Active" : "Inactive"}
        </span>
      </button>
    </td>
    <td className="p-5">
      <div className="flex items-center justify-end gap-1">
        <button onClick={() => onEdit(cat)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all">
          <Edit3 size={16} />
        </button>
        <button onClick={() => onDelete(cat._id, cat.name)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
));
CategoryRow.displayName = "CategoryRow";

// ── Validators ────────────────────────────────────────────────────────────────
const VALIDATORS = {
  name:        (v) => (!v?.trim() ? "Collection name is required" : v.trim().length < 2 ? "Name too short" : ""),
  imageUrl:    (v) => (v && !v.startsWith("http") ? "Must be a valid URL starting with http" : ""),
  description: ()  => "",
  isActive:    ()  => "",
};

const EMPTY_FORM = { name: "", isActive: "active", description: "", imageUrl: "" };

// ── Modal ─────────────────────────────────────────────────────────────────────
const CategoryModal = ({ onClose, onSave, category }) => {
  const isEdit = !!category;

  // ── Lazy useState init — only runs once on mount ──
  // OLD: useState(category || {...}) computed the object on every render
  // NEW: lazy init fn runs exactly once
  const [formData, setFormData] = useState(() =>
    category
      ? { ...category, imageUrl: category.image || "", isActive: category.isActive === false ? "inactive" : "active" }
      : { ...EMPTY_FORM }
  );
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ── useCallback on handlers ──
  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = VALIDATORS[key]?.(value) || "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, []);

  // FIX: removed the early return bug from original — blur should always validate
  const handleBlur = useCallback((key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = VALIDATORS[key]?.(formData[key] || "") || "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(VALIDATORS).map((k) => [k, true]));
    setTouched(allTouched);
    const newErrors = {};
    Object.entries(VALIDATORS).forEach(([k, fn]) => {
      const msg = fn(formData[k] || "");
      if (msg) newErrors[k] = msg;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setIsSaving(true);
    // FIX: pass _id inside data so saveCategory knows it's an edit
    // OLD: parent used editingCategory._id from state (stale closure risk)
    // NEW: _id travels with the form data — always fresh
    await onSave(isEdit ? { ...formData, _id: category._id } : formData);
    setIsSaving(false);
  };

  const fieldCls = useCallback((key, extra = "") => {
    const hasErr     = touched[key] && errors[key];
    const hasSuccess = touched[key] && !errors[key] && formData[key];
    return [
      "w-full bg-stone-50 border rounded-xl px-4 py-3 text-sm outline-none transition-all",
      extra,
      hasErr     ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
      : hasSuccess ? "border-emerald-400 ring-2 ring-emerald-50"
      : "border-stone-200 focus:border-amber-500",
    ].join(" ");
  }, [touched, errors, formData]);

  const FieldMsg = ({ fieldKey }) => {
    if (!touched[fieldKey]) return null;
    if (errors[fieldKey]) return (
      <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
        <span>!</span> {errors[fieldKey]}
      </p>
    );
    if (formData[fieldKey]) return (
      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
        <span>✓</span> Looks good
      </p>
    );
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isEdit ? "Modify Collection" : "New Collection"}
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Category Registry</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Collection Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className={fieldCls("name")}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                />
                <FieldMsg fieldKey="name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-1">
                  <Globe size={10} /> Visibility Status
                </label>
                <select
                  className={fieldCls("isActive")}
                  value={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.value)}
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Archived (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Image URL</label>
                <input
                  type="text"
                  className={fieldCls("imageUrl")}
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  onBlur={() => handleBlur("imageUrl")}
                />
                <FieldMsg fieldKey="imageUrl" />
                <div className="h-24 w-full rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center mt-1">
                  {formData.imageUrl && !errors.imageUrl
                    ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    : <ImageIcon className="text-stone-300" size={24} />}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
              <AlignLeft size={12} /> Description
            </label>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 h-24 resize-none transition-all"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEdit ? "Update Registry" : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Categories;