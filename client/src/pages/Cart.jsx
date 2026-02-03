import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem'; 

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, getCartItemCount, clearCart, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getCartTotal();

  const discountData = useMemo(() => {
    if (subtotal >= 100000) return { p: 8, amt: subtotal * 0.08 };
    if (subtotal >= 50000) return { p: 5, amt: subtotal * 0.05 };
    return { p: 0, amt: 0 };
  }, [subtotal]);

  const deliveryCharge = (subtotal >= 10000 || subtotal === 0) ? 0 : 499;
  const totalPayable = subtotal - discountData.amt + deliveryCharge;

  // 1. ADDED: Loading State Handler
  // Prevents "Empty Cart" message from showing while the database is being queried
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="h-10 w-10 animate-spin text-amber-700 mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Syncing Collection...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-stone-50">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-stone-300" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Collection is Empty</h1>
        <p className="text-stone-500 max-w-sm mb-8 font-serif italic">Your architectural selection is currently empty. Begin curating your space.</p>
        <Button onClick={() => navigate('/products')} className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-12 rounded-none uppercase tracking-widest text-[10px]">
          Return to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-stone-200 pb-6">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-stone-400 hover:text-amber-700 mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Catalog
            </button>
            <h1 className="text-4xl font-serif font-bold text-stone-900">Project Cart</h1>
          </div>
          <div className="flex flex-col items-end">
             <p className="text-stone-500 font-serif italic mt-2 md:mt-0">
                {getCartItemCount()} curated item{getCartItemCount() !== 1 ? 's' : ''}
              </p>
              {/* 2. ADDED: Visual indicator if the cart is syncing in the background */}
              {isLoading && <span className="text-[8px] text-amber-600 animate-pulse uppercase tracking-tighter">Updating Server...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Items List */}
          <div className="lg:col-span-8 space-y-2">
            <div className="hidden md:grid grid-cols-12 px-4 mb-4 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <div className="col-span-6">Product Specification</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
            
            <button 
              onClick={clearCart}
              className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-600 font-bold transition-colors ml-auto px-4"
            >
              <Trash2 size={12} /> Empty Collection
            </button>
          </div>

          {/* RIGHT: Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-stone-200 p-8 sticky top-28 shadow-sm">
              <h2 className="text-lg font-serif font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discountData.p > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Volume Discount ({discountData.p}%)</span>
                    <span className="font-mono">- ₹{discountData.amt.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Logistics</span>
                  <span className="font-mono">{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-6 mb-8 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 uppercase tracking-widest text-xs">Total</span>
                <span className="text-2xl font-mono font-bold text-amber-800">₹{Math.round(totalPayable).toLocaleString()}</span>
              </div>

              <Button
                onClick={() => navigate('/buy-all', { state: { items: cartItems } })}
                disabled={isCheckingOut || isLoading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white h-14 rounded-none font-bold uppercase tracking-[0.2em] text-[11px]"
              >
                {isCheckingOut ? <Loader2 className="animate-spin" /> : 'Proceed to Checkout'}
              </Button>

              <div className="mt-8 space-y-3 border-t border-stone-100 pt-6">
                <div className="flex items-center gap-3 text-[10px] text-stone-400 uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-600" /> Secure Architectural Escrow
                </div>
                <div className="flex items-center gap-3 text-[10px] text-stone-400 uppercase tracking-wider">
                  <Zap size={14} className="text-amber-600" /> Express Industrial Dispatch
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;