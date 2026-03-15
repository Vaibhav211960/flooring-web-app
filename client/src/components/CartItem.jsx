import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="group bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all md:grid md:grid-cols-12 md:items-center flex flex-col gap-4">

      {/* Product Info */}
      <div className="md:col-span-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-stone-50 border border-stone-100 rounded-xl shrink-0 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-stone-900 leading-tight text-sm">
            {item.name}
          </h3>
          <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 font-bold">
            {item.woodType || "Flooring"}
          </p>
          <p className="text-[10px] text-amber-700 font-bold mt-1 uppercase tracking-wider">
            ₹{item.price?.toLocaleString("en-IN")} / {item.unit || "unit"}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="md:col-span-3 flex justify-center">
        <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
            disabled={item.quantity <= 10}
            className="p-2.5 hover:bg-white text-stone-500 disabled:opacity-30 transition-colors"
          >
            <Minus size={13} />
          </button>
          <span className="w-10 text-center text-sm font-bold text-stone-900">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
            className="p-2.5 hover:bg-white text-stone-500 transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Total + Remove */}
      <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-4">
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">
            Total
          </p>
          <p className="font-bold text-stone-900 text-sm">
            ₹{item.total?.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={() => removeFromCart(item._id)}
          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          aria-label="Remove item"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;