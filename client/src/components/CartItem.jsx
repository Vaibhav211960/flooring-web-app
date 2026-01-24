import { Trash2 } from 'lucide-react';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="group bg-white border border-stone-200 p-4 md:p-6 transition-all hover:border-amber-200 md:grid md:grid-cols-12 md:items-center flex flex-col gap-4">
      {/* Product Info */}
      <div className="md:col-span-6 flex items-center gap-4">
        <div className="w-20 h-20 bg-stone-50 border border-stone-100 flex-shrink-0 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-serif font-bold text-stone-900 leading-tight">{item.name}</h3>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{item.woodType || 'Material Selection'}</p>
          <p className="text-xs font-mono text-amber-700 mt-2">₹{item.price.toLocaleString()} / {item.unit || 'unit'}</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="md:col-span-3 flex justify-center">
        <div className="flex items-center bg-stone-50 border border-stone-200 rounded-sm overflow-hidden">
          <button
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-2 hover:bg-white text-stone-400 disabled:opacity-30 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-mono text-sm font-bold text-stone-800">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
            className="p-2 hover:bg-white text-stone-400 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Item Total & Remove */}
      <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-6">
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold mb-1">Item Total</p>
          <p className="font-mono font-bold text-stone-900">₹{item.total.toLocaleString()}</p>
        </div>
        <button
          onClick={() => removeFromCart(item._id)}
          className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
          aria-label="Remove item"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;