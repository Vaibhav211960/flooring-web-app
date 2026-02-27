import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ImageIcon, IndianRupee, Layers, Pipette, Ruler, Tag, Package,
  AlignLeft, Plus, Droplets, Trash2, Edit3, Search, Globe, Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (err) {
      toast.error("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const s = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.woodType?.toLowerCase().includes(s) ||
      p.subCategoryId?.name?.toLowerCase().includes(s)
    );
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const deleteProduct = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-stone-800">Remove this product permanently?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("adminToken");
                  await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setProducts((prev) => prev.filter((p) => p._id !== id));
                  toast.success("Product removed.");
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

  const saveProduct = async (data) => {
    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        ...data,
        isActive: data.isActive === "active" || data.isActive === true,
      };

      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`${data.name} updated successfully.`);
      } else {
        await axios.post("http://localhost:5000/api/products/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`${data.name} added to inventory.`);
      }

      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">
            Manage material specifications and inventory.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, wood type..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Product</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Specs</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Price & Stock</th>
                <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</th>
                <th className="p-5 text-right text-[10px] uppercase tracking-widest font-bold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            : <ImageIcon size={20} className="text-stone-300" />
                          }
                        </div>
                        <div>
                          <span className="text-sm font-bold text-stone-900 block">{p.name}</span>
                          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-tight flex items-center gap-1 mt-0.5">
                            <Layers size={10} /> {p.subCategoryId?.name || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                        <Droplets size={12} className="text-stone-400" /> {p.woodType} • {p.finish || "Standard"}
                      </span>
                      <span className="text-[11px] text-stone-400 italic mt-1 block">
                        {p.thicknessMM || "0"}mm · {p.color || "N/A"}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-0.5">
                        <IndianRupee size={12} /> {p.price?.toLocaleString("en-IN")}
                        <span className="text-[10px] text-stone-400 font-normal ml-1">/ {p.unit}</span>
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-1 mt-1 ${p.stock <= 5 ? "text-rose-500" : "text-emerald-600"}`}>
                        <Package size={10} /> {p.stock} units
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-100 text-stone-400 border-stone-200"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-stone-400 italic text-sm">
                    {searchTerm ? "No products match your search." : "No products yet. Add your first one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={saveProduct}
          product={editingProduct}
        />
      )}
    </div>
  );
};

// --- Modal ---
const ProductModal = ({ onClose, onSave, product }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(
    product
      ? {
          ...product,
          subCategoryId: product.subCategoryId?._id || product.subCategoryId,
          isActive: product.isActive ? "active" : "inactive",
        }
      : {
          name: "", image: "", subCategoryId: "", price: "", stock: "",
          unit: "sqft", woodType: "", finish: "", thicknessMM: "",
          color: "", isActive: "active", description: "",
        }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const subRes = await axios.get("http://localhost:5000/api/subcategories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubCategories(subRes.data.subCategories);
      } catch {
        toast.error("Failed to load categories.");
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.subCategoryId) newErrors.subCategoryId = "Required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Enter a valid price";
    if (formData.stock === "" || formData.stock < 0) newErrors.stock = "Enter a valid stock";
    if (!formData.woodType.trim()) newErrors.woodType = "Required";
    if (!formData.image.trim()) newErrors.image = "Required";
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

  const field = (f) =>
    `w-full bg-stone-50 border ${errors[f] ? "border-red-400" : "border-stone-200"} rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all`;

  const set = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-900 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Col 1 */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Name</label>
                <input type="text" className={field("name")} value={formData.name} onChange={(e) => set("name", e.target.value)} />
                {errors.name && <p className="text-[10px] text-red-500 font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Sub-Category</label>
                <select className={field("subCategoryId")} value={formData.subCategoryId} onChange={(e) => set("subCategoryId", e.target.value)}>
                  <option value="">Select sub-category</option>
                  {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                {errors.subCategoryId && <p className="text-[10px] text-red-500 font-semibold">{errors.subCategoryId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Price (₹)</label>
                  <input type="number" className={field("price")} value={formData.price} onChange={(e) => set("price", e.target.value)} />
                  {errors.price && <p className="text-[10px] text-red-500 font-semibold">{errors.price}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Unit</label>
                  <select className={field()} value={formData.unit} onChange={(e) => set("unit", e.target.value)}>
                    <option value="sqft">Sqft</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Wood Type</label>
                  <input type="text" className={field("woodType")} value={formData.woodType} onChange={(e) => set("woodType", e.target.value)} />
                  {errors.woodType && <p className="text-[10px] text-red-500 font-semibold">{errors.woodType}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Finish</label>
                  <input type="text" className={field()} value={formData.finish} onChange={(e) => set("finish", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Thickness (mm)</label>
                  <input type="number" className={field()} value={formData.thicknessMM} onChange={(e) => set("thicknessMM", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Stock</label>
                  <input type="number" className={field("stock")} value={formData.stock} onChange={(e) => set("stock", e.target.value)} />
                  {errors.stock && <p className="text-[10px] text-red-500 font-semibold">{errors.stock}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Color</label>
                <input type="text" className={field()} value={formData.color} onChange={(e) => set("color", e.target.value)} />
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Image URL</label>
                <input type="text" className={field("image")} placeholder="https://..." value={formData.image} onChange={(e) => set("image", e.target.value)} />
                {errors.image && <p className="text-[10px] text-red-500 font-semibold">{errors.image}</p>}
              </div>
              <div className="h-[100px] w-full rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                {formData.image
                  ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  : <ImageIcon size={28} className="text-stone-300" />
                }
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Status</label>
                <select className={field()} value={formData.isActive} onChange={(e) => set("isActive", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Description</label>
            <textarea
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm h-20 resize-none outline-none focus:border-amber-500 transition-all"
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-stone-100">
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
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;