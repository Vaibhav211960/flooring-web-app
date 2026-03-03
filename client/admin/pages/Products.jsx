import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ImageIcon, IndianRupee, Layers, Pipette, Ruler, Tag, Package,
  AlignLeft, Plus, Droplets, Trash2, Edit3, Search, Globe, Loader2, ShieldCheck , X
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
      const token = localStorage.getItem("token");
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
      p.sku?.toLowerCase().includes(s) || // Added SKU to search
      p.materialType?.toLowerCase().includes(s) ||
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
          <p className="text-sm font-medium text-stone-800">Disable this product catalog entry?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("token");
                  await axios.delete(`http://localhost:5000/api/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setProducts((prev) => prev.filter((p) => p._id !== id));
                  toast.success("Product disabled.");
                } catch {
                  toast.error("Disable failed.");
                }
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-200 transition-all uppercase tracking-widest"
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
      const token = localStorage.getItem("token");
      const payload = {
        ...data,
        isActive: data.isActive === "active",
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                          {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-stone-300" />}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-stone-900 block">{p.name}</span>
                          <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase block mt-1">SKU: {p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-stone-800 block uppercase tracking-tight">{p.materialType}</span>
                      <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-1">
                        <Droplets size={10} className="text-amber-600" /> {p.waterResistance}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-0.5">
                        ₹{p.price?.toLocaleString("en-IN")}
                        <span className="text-[9px] text-stone-400 font-bold uppercase ml-1 tracking-widest">/ {p.unit}</span>
                      </span>
                      <span className={`text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 mt-1 ${p.stock <= 10 ? "text-rose-500" : "text-emerald-600"}`}>
                        <Package size={10} /> {p.stock} In Stock
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-stone-100 text-stone-400 border-stone-200"}`}>
                        {p.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(p)} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => deleteProduct(p._id)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-stone-400 italic text-sm">No materials match your parameters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <ProductModal onClose={() => setIsModalOpen(false)} onSave={saveProduct} product={editingProduct} />
      )}
    </div>
  );
};

// --- Updated Modal for New Schema ---
const ProductModal = ({ onClose, onSave, product }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with all new schema fields
  const [formData, setFormData] = useState(
    product ? {
      ...product,
      subCategoryId: product.subCategoryId?._id || product.subCategoryId,
      isActive: product.isActive ? "active" : "inactive",
    } : {
      name: "", sku: "", description: "", image: "",
      price: "", pricePerBox: "", unit: "sqft", stock: "",
      materialType: "", woodType: "", color: "", colorFamily: "", finish: "",
      thicknessMM: "", lengthMM: "", widthMM: "", waterResistance: "Not-resistant",
      subCategoryId: "", isActive: "active"
    }
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/subcategories", { headers: { Authorization: `Bearer ${token}` } });
        setSubCategories(res.data.subCategories);
      } catch {
        toast.error("Failed to load categories.");
      }
    };
    fetchCats();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    // If we are editing, SKU shouldn't be required to change, but must exist. If new, must be filled.
    if (!product && !formData.sku?.trim()) newErrors.sku = "Required"; 
    if (!formData.materialType?.trim()) newErrors.materialType = "Required";
    if (!formData.subCategoryId) newErrors.subCategoryId = "Required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Invalid Price";
    if (formData.stock === "" || formData.stock < 0) newErrors.stock = "Invalid Stock";
    if (!formData.pricePerBox || formData.pricePerBox <= 0) newErrors.pricePerBox = "Invalid Price Per Box";
    if (!formData.lengthMM || formData.lengthMM <= 0) newErrors.lengthMM = "Invalid Length";
    if (!formData.widthMM || formData.widthMM <= 0) newErrors.widthMM = "Invalid Width";
    if (!formData.image.trim()) newErrors.image = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const field = (f) => `w-full bg-white border ${errors[f] ? "border-red-400 shadow-[0_0_0_2px_rgba(248,113,113,0.2)]" : "border-stone-200 focus:border-amber-500"} rounded-xl px-4 py-3 text-sm outline-none transition-all`;
  
  const set = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-50 rounded-[2rem] w-full max-w-5xl shadow-2xl border border-stone-200 overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {product ? "Edit Specifications" : "New Material Entry"}
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Architectural Database</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Section 1: Identification */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">1. Identification & Media</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Material Name *</label>
                    <input type="text" className={field("name")} value={formData.name} onChange={(e) => set("name", e.target.value)} disabled={!!product} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">SKU Code *</label>
                    <input type="text" className={`${field("sku")} font-mono uppercase`} value={formData.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} disabled={!!product} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Sub-Category *</label>
                    <select className={field("subCategoryId")} value={formData.subCategoryId} onChange={(e) => set("subCategoryId", e.target.value)}>
                      <option value="">Select Category</option>
                      {subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Material Family *</label>
                    <input type="text" placeholder="e.g. Hardwood, Vinyl" className={field("materialType")} value={formData.materialType} onChange={(e) => set("materialType", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Primary Image URL *</label>
                 <input type="text" className={field("image")} placeholder="https://..." value={formData.image} onChange={(e) => set("image", e.target.value)} />
                 <div className="h-24 w-full mt-2 rounded-xl border border-stone-200 bg-white flex items-center justify-center overflow-hidden">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" alt="Preview" /> : <ImageIcon size={24} className="text-stone-300" />}
                 </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financials & Logistics */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">2. Financials & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Price *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14}/>
                  <input type="number" className={`pl-8 ${field("price")}`} value={formData.price} onChange={(e) => set("price", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Base Unit</label>
                <select className={field()} value={formData.unit} onChange={(e) => set("unit", e.target.value)}>
                  <option value="sqft">Sq. Ft.</option>
                  <option value="box">Box</option>
                  <option value="plank">Plank</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Price/Box</label>
                <input type="number" className={field()} value={formData.pricePerBox} onChange={(e) => set("pricePerBox", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Current Stock *</label>
                <input type="number" className={field("stock")} value={formData.stock} onChange={(e) => set("stock", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Physical & Technical Specs */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">3. Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Wood Species</label>
                <input type="text" className={field()} value={formData.woodType} onChange={(e) => set("woodType", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Specific Color</label>
                <input type="text" className={field()} value={formData.color} onChange={(e) => set("color", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Color Family</label>
                <select className={field()} value={formData.colorFamily} onChange={(e) => set("colorFamily", e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Dark">Dark</option>
                  <option value="Gray">Gray</option>
                  <option value="Natural">Natural</option>
                  <option value="White">White</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Surface Finish</label>
                <input type="text" placeholder="e.g. Matte" className={field()} value={formData.finish} onChange={(e) => set("finish", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Thickness (mm)</label>
                <input type="number" className={field()} value={formData.thicknessMM} onChange={(e) => set("thicknessMM", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Length (mm)</label>
                <input type="number" className={field()} value={formData.lengthMM} onChange={(e) => set("lengthMM", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Width (mm)</label>
                <input type="number" className={field()} value={formData.widthMM} onChange={(e) => set("widthMM", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Water Resistance</label>
                <select className={field()} value={formData.waterResistance} onChange={(e) => set("waterResistance", e.target.value)}>
                  <option value="Not-resistant">Not-resistant</option>
                  <option value="Water-resistant">Water-resistant</option>
                  <option value="Waterproof">Waterproof</option>
                </select>
              </div>
             
            </div>
          </div>

          {/* Section 4: Extra & Description */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-amber-700 tracking-[0.2em] border-b border-stone-200 pb-2">4. Visibility & Description</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Rich Description *</label>
                <textarea
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm h-24 resize-none outline-none focus:border-amber-500 transition-all shadow-inner"
                  value={formData.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Catalog Status</label>
                  <select className={field()} value={formData.isActive} onChange={(e) => set("isActive", e.target.value)}>
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Disabled (Hidden)</option>
                  </select>
                </div>
                
              </div>
            </div>
          </div>
          
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-200 bg-white flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-3 rounded-xl bg-stone-900 text-amber-500 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : product ? "Commit Update" : "Log Material"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Products;