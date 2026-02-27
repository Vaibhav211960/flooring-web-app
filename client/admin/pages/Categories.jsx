import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, ImageIcon, AlignLeft, Globe, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.categories);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory({ ...category, imageUrl: category.image });
    setIsModalOpen(true);
  };

  const saveCategory = async (data) => {
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        name: data.name,
        description: data.description,
        image: data.imageUrl,
        status: data.isActive || "active",
      };

      if (editingCategory) {
        await axios.put(
          `http://localhost:5000/api/categories/${editingCategory._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Collection updated successfully.");
      } else {
        await axios.post("http://localhost:5000/api/categories/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("New collection created.");
      }

      fetchCategories();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const deleteCategory = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Remove this collection from the registry?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("adminToken");
                  await axios.delete(`http://localhost:5000/api/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setCategories((prev) => prev.filter((c) => c._id !== id));
                  toast.success("Collection removed.");
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
          <h1 className="font-serif text-3xl font-bold text-stone-900">Material Collections</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Define and organize your core flooring categories.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
        >
          <Plus size={14} /> New Collection
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-stone-400 italic text-sm">
            No collections found. Create your first one.
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
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="h-12 w-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-stone-300" />
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-stone-900 block">{cat.name}</span>
                    <p className="text-[11px] text-stone-400 italic line-clamp-1 mt-0.5">
                      {cat.description || "No description provided."}
                    </p>
                  </td>
                  <td className="p-5 font-mono text-[10px] text-stone-500 italic">
                    /{cat.name.toLowerCase().replace(/ /g, "-")}
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${
                        cat.isActive === false
                          ? "bg-stone-100 text-stone-400 border-stone-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {cat.isActive === false ? "inactive" : "active"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat._id)}
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
        <CategoryModal
          onClose={() => setIsModalOpen(false)}
          onSave={saveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
};

// --- Modal ---
const CategoryModal = ({ onClose, onSave, category }) => {
  const [formData, setFormData] = useState(
    category || { name: "", slug: "", isActive: "active", description: "", imageUrl: "" }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {category ? "Modify Collection" : "New Collection"}
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
            {/* Left col */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Collection Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-1">
                  <Globe size={10} /> Visibility Status
                </label>
                <select
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Archived (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Right col */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              <div className="h-24 w-full rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden flex items-center justify-center">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <ImageIcon className="text-stone-300" size={24} />
                )}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Footer buttons */}
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
              ) : category ? (
                "Update Registry"
              ) : (
                "Create Collection"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Categories;