import React, { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Home as HomeIcon, ChevronRight, Truck, ShieldCheck, 
  CreditCard, Package, Info, AlertCircle 
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function BuyNow() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const location = useLocation(); // 2. Initialize the hook

  // 3. Get the quantity from state, or default to 1 if state is null
  const initialQty = location.state?.quantity || 1;

  // State for Product (Fetching from API instead of static array)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for Order
  const [units, setUnits] = useState(initialQty);
  const [form, setForm] = useState({
    fullName: "",
    contact: "",
    pincode: "",
    landmark: "",
    address: ""
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const subtotal = useMemo(() => (product?.price || 0) * units, [units, product]);
  const deliveryCharge = useMemo(() => (subtotal >= 10000 || subtotal === 0 ? 0 : 499), [subtotal]);
  const netBill = subtotal + deliveryCharge;

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // RAZORPAY INTEGRATION HANDLER
const handlePlaceOrder = async () => {
    // 1. Validation
    if (!form.fullName || !form.contact || !form.address || !form.pincode) {
      alert("Please fill in all delivery details including Pincode.");
      return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", 
      amount: netBill * 100, 
      currency: "INR",
      name: "Gemini Flooring",
      description: `Purchase of ${product.name}`,
      image: product.image,
      handler: async function (response) {
        try {
          // 2. Prepare Payload strictly following your Mongoose Model
          const orderPayload = {
            // items: [orderItemSchema]
            items: [
              {
                productId: product._id,         // Matches ObjectId ref: "Product"
                productName: product.name,      // Matches String
                pricePerUnit: product.price,    // Matches Number
                units: units,                   // Matches Number
                totalAmount: subtotal           // price * units
                // discountPerService: 0        // optional, defaults to 0
              }
            ],
            // Main Schema Fields
            netBill: netBill,                   // Total including delivery
            paymentMode: "Online",              // Matches Enum: ["COD", "Online"]
            // orderStatus: "pending"           // Backend default is "pending"
          };

          // 3. API Call to save order
          const res = await axios.post(
            "http://localhost:5000/api/orders", 
            orderPayload,
            { 
              headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}` 
              } 
            }
          );

          if (res.status === 201 || res.status === 200) {
            alert("Order Placed Successfully!");
            navigate("/order-history");
          }
        } catch (err) {
          console.error("Database Save Error:", err);
          alert("Payment was successful, but we couldn't save your order. Please contact support with Payment ID: " + response.razorpay_payment_id);
        }
      },
      prefill: {
        name: form.fullName,
        contact: form.contact,
      },
      notes: {
        address: form.address,
        pincode: form.pincode,
        landmark: form.landmark
      },
      theme: {
        color: "#1c1917",
      },
    };

    // const rzp = new window.Razorpay(options);
    // rzp.open();
  };
  
    if (loading) return <div className="h-screen flex items-center justify-center">Loading Checkout...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center">Product Not Found</div>;

  

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      <section className="bg-stone-900 text-stone-50">
        <div className="container max-w-7xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-amber-500 font-bold">Secure Checkout</span>
          </nav>
          <h1 className="font-serif text-4xl font-bold">Shipping & <span className="italic text-amber-500">Review</span></h1>
        </div>
      </section>

      <main className="flex-grow py-12">
        <div className="container max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Form */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-700"><Truck size={20} /></div>
                <h2 className="text-xl font-serif font-bold">Delivery Destination</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" name="fullName" value={form.fullName} onChange={handleInput} placeholder="e.g. Vaibhav Parmar" />
                <InputField label="Contact Number" name="contact" value={form.contact} onChange={handleInput} placeholder="+91 00000 00000" />
                <InputField label="Pincode" name="pincode" value={form.pincode} onChange={handleInput} placeholder="380015" />
                <InputField label="Landmark" name="landmark" value={form.landmark} onChange={handleInput} placeholder="Near Metro Station" />
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Full Address</label>
                  <textarea
                    name="address" rows="3" value={form.address} onChange={handleInput}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                    placeholder="House no, street, area, city"
                  />
                </div>
              </div>
            </div>

            {/* Product Summary Preview */}
            <div className="bg-stone-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
              <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded-xl shadow-sm" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-stone-500 text-sm mb-2">{product.woodType} | {product.thicknessMM}mm</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg bg-white">
                    <button onClick={() => setUnits(Math.max(1, units - 1))} className="p-2 border-r">-</button>
                    <span className="px-4 font-bold">{units}</span>
                    <button onClick={() => setUnits(units + 1)} className="p-2 border-l">+</button>
                  </div>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">Units ({product.unit}s)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400 uppercase font-bold">Price per {product.unit}</p>
                <p className="text-xl font-mono font-bold">₹{product.price}</p>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xl p-8 sticky top-24">
              <h2 className="text-xl font-serif font-bold mb-6">Payment Summary</h2>
              
              <div className="space-y-4 text-sm border-b border-stone-100 pb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({units} units)</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping & Handling</span>
                  <span className="font-mono text-emerald-600">{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertCircle size={12} /> Add ₹{(10000 - subtotal).toLocaleString()} more for FREE shipping
                  </div>
                )}
              </div>

              <div className="py-6 flex justify-between items-baseline">
                <span className="font-bold text-stone-900">Total Payable</span>
                <span className="text-2xl font-mono font-bold text-amber-700">₹{netBill.toLocaleString()}</span>
              </div>

              <Button 
                onClick={handlePlaceOrder}
                className="w-full h-14 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <CreditCard size={18} /> Pay ₹{netBill.toLocaleString()}
              </Button>

              <div className="mt-6 space-y-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-stone-500 mb-1">
                     <ShieldCheck size={14} className="text-emerald-500" /> Quality Assurance
                   </div>
                   <p className="text-[9px] text-stone-400 leading-tight">Every plank undergoes a 12-point industrial moisture & finish check before dispatch.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-inner"
      />
    </div>
  );
}