import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, GitCommit, Link as LinkIcon, ImageIcon, AlignLeft, Layers, Globe, Loader2, Type } from "lucide-react";
import { toast } from "react-hot-toast";

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const fetchSubCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/subcategories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories(res.data.subCategories);
    } catch (err) {
      toast.error("Failed to load sub-categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const openAddModal = () => {
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sc) => {
    setEditingSubCategory({
      ...sc,
      imageUrl: sc.image,
      categoryId: sc.categoryId?._id || sc.categoryId,
    });
    setIsModalOpen(true);
  };

  const saveSubCategory = async (data) => {
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        image: data.imageUrl,
        status: data.isActive || "active",
      };

      if (editingSubCategory) {
        await axios.put(
          `http://localhost:5000/api/subcategories/${editingSubCategory._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`${data.name} updated successfully.`);
      } else {
        await axios.post("http://localhost:5000/api/subcategories/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`${data.name} created successfully.`);
      }

      fetchSubCategories();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const deleteSubCategory = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Remove this sub-category?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("adminToken");
                  await axios.delete(`http://localhost:5000/api/subcategories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setSubCategories((prev) => prev.filter((sc) => sc._id !== id));
                  toast.success("Sub-category removed.");
                } catch {
                  toast.error("Delete failed.");
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

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
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
        >
          <Plus size={14} /> Add Sub-Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
          </div>
        ) : subCategories.length === 0 ? (
          <div className="text-center py-16 text-stone-400 italic text-sm">
            No sub-categories found. Create your first one.
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
              {subCategories.map((sc) => (
                <tr key={sc._id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="h-12 w-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {sc.image ? (
                        <img src={sc.image} alt={sc.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-stone-300" />
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-stone-900 block">{sc.name}</span>
                    <span className="text-[11px] text-stone-400 italic flex items-center gap-1 mt-0.5">
                      <LinkIcon size={10} /> /{sc.name.toLowerCase().replace(/ /g, "-")}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-tight">
                      <GitCommit size={12} className="text-amber-600" />
                      {sc.categoryId?.name || "Unlinked"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        sc.isActive === false
                          ? "bg-stone-100 text-stone-400 border-stone-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {sc.isActive === false ? "inactive" : "active"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(sc)}
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteSubCategory(sc._id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <SubCategoryModal
          onClose={() => setIsModalOpen(false)}
          onSave={saveSubCategory}
          subCategory={editingSubCategory}
        />
      )}
    </div>
  );
};

// --- Modal ---
const SubCategoryModal = ({ onClose, onSave, subCategory }) => {
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(
    subCategory || { name: "", categoryId: "", status: "active", description: "", imageUrl: "" }
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.categories);
      } catch {
        toast.error("Failed to load categories.");
      }
    };
    fetchCats();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.categoryId) newErrors.categoryId = "Parent category is required";
    if (formData.imageUrl && !formData.imageUrl.startsWith("http"))
      newErrors.imageUrl = "Must be a valid URL starting with http";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {subCategory ? "Edit Sub-Category" : "New Sub-Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Name
                </label>
                <input
                  type="text"
                  className={`w-full bg-stone-50 border ${errors.name ? "border-red-400" : "border-stone-200"} rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all`}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Parent Category
                </label>
                <select
                  className={`w-full bg-stone-50 border ${errors.categoryId ? "border-red-400" : "border-stone-200"} rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all`}
                  value={formData.categoryId}
                  onChange={(e) => {
                    setFormData({ ...formData, categoryId: e.target.value });
                    if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.categoryId}</p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Status
                </label>
                <select
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className={`w-full bg-stone-50 border ${errors.imageUrl ? "border-red-400" : "border-stone-200"} rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all`}
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (errors.imageUrl) setErrors({ ...errors, imageUrl: "" });
                  }}
                />
                {errors.imageUrl && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.imageUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
              Description
            </label>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 h-24 resize-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : subCategory ? (
                "Save Changes"
              ) : (
                "Create Sub-Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategories;