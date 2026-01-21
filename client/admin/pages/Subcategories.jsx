import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit3,
  Trash2,
  GitCommit,
  Link as LinkIcon,
} from "lucide-react";
import {
  X,
  Hash,
  Type,
  ImageIcon,
  AlignLeft,
  Layers,
  Globe,
} from "lucide-react";

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const fetchSubCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/subcategories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories(res.data.subCategories);
    } catch (err) {
      console.error("Fetch failed", err);
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
    // Map backend 'image' and 'categoryId' to frontend modal state
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
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/subcategories/create",
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      fetchSubCategories();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Error saving sub-category");
    }
  };

  const deleteSubCategory = async (id) => {
    if (!window.confirm("Remove this sub-classification?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/subcategories/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSubCategories((prev) => prev.filter((sc) => sc._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // const toggleStatus = async (sc) => {
    // try {
    //   const token = localStorage.getItem("adminToken");
    //   const newStatus = sc.isActive === false ? true : false;
    //   await axios.put(
    //     `http://localhost:5000/api/subcategories/${sc._id}`,
    //     {
    //       ...sc,
    //       isActive: newStatus,
    //       image: sc.image,
    //       categoryId: sc.categoryId?._id,
    //     },
    //     { headers: { Authorization: `Bearer ${token}` } },
    //   );
    //   setSubCategories((prev) =>
    //     prev.map((item) =>
    //       item._id === sc._id ? { ...item, isActive: newStatus } : item,
    //     ),
    //   );
    // } catch (err) {
    //   alert("Status update failed");
    // }
  // };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Material Sub-Class
          </h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Narrow down collections into specific material types.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
        >
          <Plus size={14} /> Add Sub-Class
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Asset
              </th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Sub-Classification
              </th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Parent Registry
              </th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Status
              </th>
              <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {subCategories.map((sc) => (
              <tr
                key={sc._id}
                className="hover:bg-stone-50/50 transition-colors group"
              >
                <td className="p-5">
                  <div className="h-12 w-16 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                    {sc.image ? (
                      <img
                        src={sc.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon
                        className="m-auto mt-4 text-stone-300"
                        size={16}
                      />
                    )}
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-900">
                      {sc.name}
                    </span>
                    <span className="text-[11px] text-stone-400 italic flex items-center gap-1">
                      <LinkIcon size={10} /> /
                      {sc.name.toLowerCase().replace(/ /g, "-")}
                    </span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-tight">
                    <GitCommit size={12} className="text-amber-600" />{" "}
                    {sc.categoryId?.name || "Unlinked"}
                  </span>
                </td>
                <td className="p-5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      sc.isActive === false
                        ? "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                    }`}
                  >
                    {sc.isActive === false ? "inactive" : "active"}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(sc)}
                      className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteSubCategory(sc._id)}
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const SubCategoryModal = ({ onClose, onSave, subCategory }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(
    subCategory || {
      name: "",
      categoryId: "",
      status: "",
      description: "",
      imageUrl: "",
    },
  );

  // Fetch Parent Categories for the dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {subCategory ? "Modify Sub-Class" : "Define Sub-Classification"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
                  <Type size={12} className="text-amber-600" /> Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
                  <Layers size={12} className="text-amber-600" /> Parent
                  Collection
                </label>
                <select
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
                  <Globe size={12} className="text-amber-600" /> Status
                </label>
                <select
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
                  <ImageIcon size={12} className="text-amber-600" /> Image URL
                </label>
                <input
                  type="text"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2">
              <AlignLeft size={12} className="text-amber-600" /> Description
            </label>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 h-24 resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase tracking-widest shadow-lg"
            >
              {subCategory ? "Update Classification" : "Create Sub-Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCategories;
