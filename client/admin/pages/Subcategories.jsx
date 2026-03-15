import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Plus, Edit3, Trash2, GitCommit, Link as LinkIcon,
  ImageIcon, AlignLeft, Loader2, X, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── Same shared axios instance pattern ──
// FIX: was using "adminToken" — unified to "token" to match Products.jsx
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ← unified key
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Module-level caches ──
// OLD: categories fetched from server every time the modal opened
// NEW: cached after first fetch — subsequent modal opens are instant
let subCategoryCache = null;
let parentCategoryCache = null;

const ITEMS_PER_PAGE = 8;

const SubCategories = () => {
  const [subCategories,      setSubCategories]      = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [currentPage,        setCurrentPage]        = useState(1);

  const fetchSubCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/subcategories");
      setSubCategories(res.data.subCategories);
      subCategoryCache = res.data.subCategories;
    } catch {
      toast.error("Failed to load sub-categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubCategories(); }, [fetchSubCategories]);

  // ── useMemo: search filter ──
  const filteredSubCategories = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return subCategories;
    return subCategories.filter((sc) =>
      sc.name?.toLowerCase().includes(s) ||
      sc.categoryId?.name?.toLowerCase().includes(s) ||
      sc.description?.toLowerCase().includes(s)
    );
  }, [subCategories, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSubCategories.length / ITEMS_PER_PAGE));

  // ── useMemo: paginated slice ──
  const paginatedSubCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSubCategories, currentPage]);

  const openAddModal  = useCallback(() => { setEditingSubCategory(null); setIsModalOpen(true); }, []);
  const openEditModal = useCallback((sc) => {
    setEditingSubCategory({
      ...sc,
      imageUrl:   sc.image || "",
      // FIX: normalize categoryId to just the ID string — not the full object
      // OLD: sc.categoryId was sometimes a full object {_id, name}, breaking the select value
      // NEW: always extract _id if it's an object
      categoryId: sc.categoryId?._id || sc.categoryId,
    });
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  // ── Quick status toggle ──
  const toggleStatus = useCallback(async (sc) => {
    setSubCategories((prev) =>
      prev.map((item) => item._id === sc._id ? { ...item, isActive: !sc.isActive } : item)
    );
    try {
      await api.put(`/subcategories/${sc._id}`, { isActive: !sc.isActive });
      toast.success(`${sc.name} marked ${!sc.isActive ? "Active" : "Inactive"}.`);
    } catch {
      setSubCategories((prev) =>
        prev.map((item) => item._id === sc._id ? { ...item, isActive: sc.isActive } : item)
      );
      toast.error("Status update failed.");
    }
  }, []);

  const deleteSubCategory = useCallback((id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">
            Remove <strong>{name}</strong>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/subcategories/${id}`);
                  // Optimistic delete
                  setSubCategories((prev) => prev.filter((sc) => sc._id !== id));
                  subCategoryCache = null; // invalidate cache
                  toast.success("Sub-category removed.");
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

  // ── Optimistic save ──
  // FIX: was sending `status` field but table displayed `isActive` — inconsistent field names
  // NEW: always send `isActive` as boolean — one source of truth
  const saveSubCategory = useCallback(async (data) => {
    try {
      const payload = {
        categoryId:  data.categoryId,
        name:        data.name,
        description: data.description,
        image:       data.imageUrl,
        // FIX: normalize isActive — form uses "active"/"inactive" strings
        isActive:    data.isActive !== "inactive",
      };

      if (data._id) {
        const res = await api.put(`/subcategories/${data._id}`, payload);
        const updated = res.data.subCategory;
        setSubCategories((prev) =>
          prev.map((sc) => sc._id === updated._id ? updated : sc)
        );
        subCategoryCache = null;
        toast.success(`${data.name} updated successfully.`);
      } else {
        const res = await api.post("/subcategories/create", payload);
        const created = res.data.subCategory;
        setSubCategories((prev) => [created, ...prev]);
        subCategoryCache = null;
        toast.success(`${data.name} created successfully.`);
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
          <h1 className="font-serif text-3xl font-bold text-stone-900">Sub Categories</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Narrow down collections into specific material types.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sub-categories..."
              className="pl-4 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} /> Add Sub-Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Loading Sub-Categories...</p>
          </div>
        ) : filteredSubCategories.length === 0 ? (
          <div className="text-center py-16 text-stone-400 italic text-sm">
            {searchTerm ? "No sub-categories match your search." : "No sub-categories found. Create your first one."}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Preview</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Name</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Parent Category</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedSubCategories.map((sc) => (
                <SubCategoryRow
                  key={sc._id}
                  subCategory={sc}
                  onEdit={openEditModal}
                  onDelete={deleteSubCategory}
                  onToggleStatus={toggleStatus}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination Bar ── */}
      {!isLoading && filteredSubCategories.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-widest">
            Showing{" "}
            <span className="text-stone-700 font-bold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubCategories.length)}
            </span>
            {" "}of{" "}
            <span className="text-stone-700 font-bold">{filteredSubCategories.length}</span>
            {" "}sub-categories
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
        <SubCategoryModal
          onClose={closeModal}
          onSave={saveSubCategory}
          subCategory={editingSubCategory}
        />
      )}
    </div>
  );
};

// ── SubCategoryRow as its own memoized component ──
// OLD: inline JSX inside .map() — all rows re-rendered on every state change
// NEW: React.memo — only the changed row re-renders
const SubCategoryRow = React.memo(({ subCategory: sc, onEdit, onDelete, onToggleStatus }) => (
  <tr className="hover:bg-stone-50/50 transition-colors group">
    <td className="p-5">
      <div className="h-12 w-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
        {sc.image
          ? <img src={sc.image} alt={sc.name} className="w-full h-full object-cover" loading="lazy" />
          : <ImageIcon size={16} className="text-stone-300" />}
      </div>
    </td>
    <td className="p-5">
      <span className="text-sm font-bold text-stone-900 block">{sc.name}</span>
      <span className="text-[11px] text-stone-400 italic flex items-center gap-1 mt-0.5">
        <LinkIcon size={10} /> /{sc.name?.toLowerCase().replace(/ /g, "-")}
      </span>
    </td>
    <td className="p-5">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-tight">
        <GitCommit size={12} className="text-amber-600" />
        {sc.categoryId?.name || "Unlinked"}
      </span>
    </td>
    <td className="p-5">
      {/* ── Quick toggle in table row ── */}
      <button
        onClick={() => onToggleStatus(sc)}
        className="flex items-center gap-1.5 group/toggle"
        title={sc.isActive ? "Click to disable" : "Click to activate"}
      >
        {sc.isActive
          ? <ToggleRight size={22} className="text-emerald-500 group-hover/toggle:text-emerald-600 transition-colors" />
          : <ToggleLeft  size={22} className="text-stone-300 group-hover/toggle:text-stone-400 transition-colors" />}
        <span className={`text-[9px] font-bold uppercase tracking-widest ${sc.isActive ? "text-emerald-600" : "text-stone-400"}`}>
          {sc.isActive ? "Active" : "Inactive"}
        </span>
      </button>
    </td>
    <td className="p-5">
      <div className="flex items-center justify-end gap-1">
        <button onClick={() => onEdit(sc)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all">
          <Edit3 size={16} />
        </button>
        <button onClick={() => onDelete(sc._id, sc.name)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
));
SubCategoryRow.displayName = "SubCategoryRow";

// ── Validators ────────────────────────────────────────────────────────────────
const SC_VALIDATORS = {
  name:        (v) => (!v?.trim() ? "Name is required" : v.trim().length < 2 ? "Name too short" : ""),
  categoryId:  (v) => (!v ? "Parent category is required" : ""),
  imageUrl:    (v) => (v && !v.startsWith("http") ? "Must be a valid URL starting with http" : ""),
  description: ()  => "",
  isActive:    ()  => "",
};

const EMPTY_SC_FORM = { name: "", categoryId: "", isActive: "active", description: "", imageUrl: "" };

// ── Modal ─────────────────────────────────────────────────────────────────────
const SubCategoryModal = ({ onClose, onSave, subCategory }) => {
  const isEdit = !!subCategory;

  const [categories, setCategories] = useState(parentCategoryCache || []);
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [isSaving,   setIsSaving]   = useState(false);

  // ── Lazy useState init ──
  // OLD: computed object on every render
  // NEW: runs exactly once on mount
  const [formData, setFormData] = useState(() =>
    subCategory
      ? {
          ...subCategory,
          imageUrl:  subCategory.imageUrl || subCategory.image || "",
          isActive:  subCategory.isActive === false ? "inactive" : "active",
          categoryId: subCategory.categoryId?._id || subCategory.categoryId || "",
        }
      : { ...EMPTY_SC_FORM }
  );

  useEffect(() => {
    // ── Cache check: skip API call if parent categories already loaded ──
    // OLD: axios.get("/categories") ran every single time modal opened
    // NEW: if parentCategoryCache exists, use it — zero network call
    if (parentCategoryCache) return;
    const fetchCats = async () => {
      try {
        const res = await api.get("/categories");
        parentCategoryCache = res.data.categories;
        setCategories(res.data.categories);
      } catch {
        toast.error("Failed to load categories.");
      }
    };
    fetchCats();
  }, []);

  const handleChange = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = SC_VALIDATORS[key]?.(value) || "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, []);

  // FIX: blur always validates — removed the broken early-return from original
  const handleBlur = useCallback((key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const msg = SC_VALIDATORS[key]?.(formData[key] || "") || "";
    setErrors((prev) => ({ ...prev, [key]: msg }));
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(SC_VALIDATORS).map((k) => [k, true]));
    setTouched(allTouched);
    const newErrors = {};
    Object.entries(SC_VALIDATORS).forEach(([k, fn]) => {
      const msg = fn(formData[k] || "");
      if (msg) newErrors[k] = msg;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors before saving.");
      return;
    }
    setIsSaving(true);
    // FIX: pass _id with data so saveSubCategory knows it's an edit
    // OLD: parent used editingSubCategory._id from state (stale closure risk)
    await onSave(isEdit ? { ...formData, _id: subCategory._id } : formData);
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
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              {isEdit ? "Edit Sub-Category" : "New Sub-Category"}
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Sub-Category Registry</p>
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
                  Name <span className="text-red-400">*</span>
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
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Parent Category <span className="text-red-400">*</span>
                </label>
                <select
                  className={fieldCls("categoryId")}
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  onBlur={() => handleBlur("categoryId")}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <FieldMsg fieldKey="categoryId" />
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Status</label>
                <select
                  className={fieldCls("isActive")}
                  value={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.value)}
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className={fieldCls("imageUrl")}
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  onBlur={() => handleBlur("imageUrl")}
                />
                <FieldMsg fieldKey="imageUrl" />
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="h-20 w-full rounded-xl border border-stone-200 overflow-hidden mt-1">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-1">
              <AlignLeft size={10} className="inline" /> Description
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
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEdit ? "Save Changes" : "Create Sub-Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategories;