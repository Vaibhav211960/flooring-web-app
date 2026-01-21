import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ChevronRight,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const initialCart = [
  {
    id: "1",
    title: "Italian Marble Tile",
    price: 2499,
    quantity: 2,
  },
  {
    id: "2",
    title: "Wooden Finish Tile",
    price: 1799,
    quantity: 3,
  },
];

export default function Cart() {
  const [cart, setCart] = useState(initialCart);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100 text-stone-900">
      <Navbar />

      {/* Header */}
      <section className="border-b border-stone-200/70 bg-stone-900/95 text-stone-50">
        <div className="container max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-xs text-stone-300 mb-4">
            <Link to="/" className="flex items-center gap-1 hover:text-white">
              <HomeIcon className="h-3 w-3" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white font-medium">Cart</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-semibold">
            Your Cart
          </h1>
          <p className="text-sm text-stone-100/90 mt-1">
            Review items before proceeding to checkout
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200">
              <h2 className="text-lg font-medium">
                Cart Items ({cart.length})
              </h2>
            </div>

            {cart.length === 0 ? (
              <div className="p-10 text-center text-stone-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Image placeholder */}
                    <div className="h-20 w-20 rounded-md border bg-stone-50 flex items-center justify-center shrink-0">
                      <span className="text-2xl opacity-30">🏠</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-stone-500 mt-1">
                        ₹{item.price} per unit
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="h-8 w-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-6 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="h-8 w-8 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price + Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-medium">
                        ₹{item.price * item.quantity}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-6 h-fit">
            <h2 className="text-lg font-medium mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            <Link to="/buy-now">
              <Button
                className="w-full mt-6 bg-stone-900 text-white hover:bg-stone-800"
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </Button>
            </Link>

            <p className="text-xs text-stone-500 text-center mt-3">
              Delivery charges calculated at checkout
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
