import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X, ImageIcon, IndianRupee, Layers, Pipette, Ruler, Tag, Package,
  AlignLeft, Plus, Droplets, Trash2, Edit3, Search, Globe
} from "lucide-react";
import { useToast } from "../../src/hooks/useToast.jsx";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();

  const darkToastStyles = "bg-stone-900 text-stone-50 border border-stone-800 font-serif shadow-2xl";

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchStr) ||
      p.woodType?.toLowerCase().includes(searchStr) ||
      p.subCategoryId?.name?.toLowerCase().includes(searchStr)
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
    if (!window.confirm("Permanently remove this product from the registry?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast({
        title: "PRODUCT REMOVED",
        description: "Product has been purged from the registry.",
        className: `${darkToastStyles} border-l-4 border-l-rose-600`
      });
    } catch (err) {
      toast({ title: "DELETE FAILED", variant: "destructive", className: darkToastStyles });
    }
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
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "PRODUCT UPDATED",
          description: `${data.name} specifications updated.`,
          className: `${darkToastStyles} border-l-4 border-l-amber-600`
        });
      } else {
        await axios.post("http://localhost:5000/api/products/create", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "NEW PRODUCT ADDED",
          description: `${data.name} is now live in inventory.`,
          className: `${darkToastStyles} border-l-4 border-l-emerald-600`
        });
      }
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: "SAVE ERROR",
        description: err.response?.data?.message || "Check network connectivity.",
        variant: "destructive",
        className: darkToastStyles
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Product Registry</h1>
          <p className="text-sm text-stone-500 mt-1 font-medium italic">Manage material specifications and inventory.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, wood type..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={openAddModal} className="flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg">
            <Plus size={14} /> Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Product Info</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Technical Specs</th>
              <th className="p-5 text-[10px] uppercase tracking-widest font-bold text-stone-400">Inventory & Price</th>
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
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                        {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-4 text-stone-300" size={20} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-stone-900 block">{p.name}</span>
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-tight flex items-center gap-1">
                          <Layers size={10} /> {p.subCategoryId?.name || "Unclassified"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                        <Droplets size={12} className="text-stone-400" /> {p.woodType} • {p.finish || "Standard"}
                      </span>
                      <span className="text-[11px] text-stone-400 italic">
                        Thickness: {p.thicknessMM || "0"}mm | Color: {p.color || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-serif font-bold text-stone-900 flex items-center gap-0.5">
                        <IndianRupee size={12} /> {p.price?.toLocaleString("en-IN")} <span className="text-[10px] text-stone-400 ml-1">/ {p.unit}</span>
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-1 mt-1 ${p.stock <= 5 ? "text-rose-500" : "text-emerald-600"}`}>
                        <Package size={10} /> {p.stock} Units Left
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-100 text-stone-400 border-stone-200"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => deleteProduct(p._id)} className="p-2 text-stone-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-20 text-center text-stone-400 italic text-sm">No products match your search.</td></tr>
            )}
          </tbody>
        </table>
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

const ProductModal = ({ onClose, onSave, product }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(
    product ? {
      ...product,
      subCategoryId: product.subCategoryId?._id || product.subCategoryId,
      isActive: product.isActive ? "active" : "inactive",
    } : {
      name: "", image: "", subCategoryId: "", price: "", stock: "", unit: "sqft",
      woodType: "", finish: "", thicknessMM: "", color: "", isActive: "active", description: "",
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const [catRes, subRes] = await Promise.all([
          axios.get("http://localhost:5000/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/subcategories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCategories(catRes.data.categories);
        setSubCategories(subRes.data.subCategories);
      } catch (err) { console.error("Fetch failed", err); }
    };
    fetchData();
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.subCategoryId) newErrors.subCategoryId = "Required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Invalid Price";
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Invalid Stock";
    if (!formData.woodType.trim()) newErrors.woodType = "Required";
    if (!formData.image.trim()) newErrors.image = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const inputClass = (field) => `w-full bg-stone-50 border ${errors[field] ? 'border-red-500' : 'border-stone-200'} rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none transition-all`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">{product ? "Edit Product Details" : "New Product Registration"}</h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-0.5">Inventory Asset Configuration</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2"><Tag size={12} /> Name</label>
                <input type="text" className={inputClass('name')} value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: ""}) }} />
                {errors.name && <span className="text-[9px] text-red-500 font-bold uppercase">{errors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2"><Layers size={12} /> Sub-Class</label>
                <select className={inputClass('subCategoryId')} value={formData.subCategoryId} onChange={(e) => { setFormData({ ...formData, subCategoryId: e.target.value }); if(errors.subCategoryId) setErrors({...errors, subCategoryId: ""}) }}>
                  <option value="">Select Category</option>
                  {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500"><IndianRupee size={12} /> Price</label>
                  <input type="number" className={inputClass('price')} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Unit</label>
                  <select className={inputClass()} value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                    <option value="sqft">Sqft</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500"><Pipette size={12} /> Wood Type</label>
                  <input type="text" className={inputClass('woodType')} value={formData.woodType} onChange={(e) => setFormData({ ...formData, woodType: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Finish</label>
                  <input type="text" className={inputClass()} value={formData.finish} onChange={(e) => setFormData({ ...formData, finish: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500"><Ruler size={12} /> Thick (MM)</label>
                  <input type="number" className={inputClass()} value={formData.thicknessMM} onChange={(e) => setFormData({ ...formData, thicknessMM: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Stock</label>
                  <input type="number" className={inputClass('stock')} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Primary Color</label>
                <input type="text" className={inputClass()} value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2"><ImageIcon size={12} /> Image URL</label>
                <input type="text" className={inputClass('image')} value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
              </div>
              <div className="h-[100px] w-full rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-stone-300" />}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2"><Globe size={12} /> Status</label>
                <select className={inputClass()} value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 flex items-center gap-2"><AlignLeft size={12} /> Description</label>
            <textarea className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm h-20 resize-none outline-none focus:border-amber-500" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="flex gap-4 pt-4 border-t border-stone-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase">Discard</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase shadow-lg shadow-stone-200">
              {product ? "Update Product" : "Save to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;