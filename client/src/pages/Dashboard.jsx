// src/pages/Dashboard.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card.jsx";

import {
  ShoppingBag,
  Clock,
  History,
  User,
  MapPin,
  Pencil,
  Layers,
  CreditCard,
} from "lucide-react";

import { useApp } from "../libs/AppProvider.jsx";

export default function Dashboard() {
  const { user } = useApp();

  // Dummy profile state (UI only)
  const [profile, setProfile] = useState({
    name: user?.name || "Demo Customer",
    email: user?.email || "demo@example.com",
    phone: "+91-9876543210",
    preferredContact: "Email",
    address: "304, Sunrise Residency,\nPrahladnagar, Ahmedabad, 380015",
  });

  const [activeTab, setActiveTab] = useState("overview");

  const displayName = profile.name;
  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Dummy order data (local only)
  const currentOrder = {
    id: "ORD-4821",
    status: "In Production",
    eta: "Approx. 7–10 days",
    datePlaced: "28 Nov 2025",
    paymentMethod: "UPI • GPay",
    paymentStatus: "Paid",
    paymentRef: "TXN-9F2X7K",
    total: "₹62,300",
    deliveryWindow: "Between 05–08 Dec 2025",
    address: profile.address,
    items: [
      { id: 1, name: "Oak Hardwood Planks", area: "Living Room", qty: "24 boxes" },
      { id: 2, name: "SPC Vinyl (Warm Sand)", area: "Kitchen", qty: "12 boxes" },
    ],
  };

  const recentOrders = [
    {
      id: "ORD-4712",
      date: "12 Nov 2025",
      total: "₹48,500",
      status: "Delivered",
      paymentMethod: "Card • HDFC Credit",
      paymentStatus: "Paid",
      itemsCount: 3,
    },
    {
      id: "ORD-4679",
      date: "02 Nov 2025",
      total: "₹31,200",
      status: "Completed",
      paymentMethod: "Netbanking • SBI",
      paymentStatus: "Paid",
      itemsCount: 2,
    },
    {
      id: "ORD-4598",
      date: "18 Oct 2025",
      total: "₹19,750",
      status: "Cancelled",
      paymentMethod: "UPI • PhonePe",
      paymentStatus: "Refunded",
      itemsCount: 1,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-100 text-stone-900">
      <Navbar />

      <main className="flex-1 py-8 md:py-10">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <header className="mb-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-stone-500 mb-2">
              Customer Dashboard
            </p>
            <h1 className="font-serif text-2xl md:text-3xl font-semibold">
              Hi {firstName}, welcome back.
            </h1>
            <p className="text-xs md:text-sm text-stone-500 mt-1">
              Manage your flooring projects, track orders, and keep your details up to date.
            </p>
          </header>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200/70">
            {[
              { id: "overview", label: "Overview" },
              { id: "orders", label: "Orders" },
              { id: "profile", label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs md:text-sm border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-amber-700 text-amber-800 font-medium"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <OverviewTab
              currentOrder={currentOrder}
              recentOrders={recentOrders}
              initials={initials}
              displayName={displayName}
            />
          )}

          {activeTab === "orders" && (
            <OrdersTab
              currentOrder={currentOrder}
              recentOrders={recentOrders}
            />
          )}

          {activeTab === "profile" && (
            <ProfileTab
              initials={initials}
              profile={profile}
              onProfileSave={setProfile}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Overview Tab ---------- */

function OverviewTab({ currentOrder, recentOrders, initials, displayName }) {
  return (
    <div className="space-y-6">
      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Current order summary card */}
        <Card className="bg-white/90 border-stone-200/80 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-stone-700">
              Current Order
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent className="text-xs text-stone-600 space-y-1">
            <p className="font-mono text-sm font-semibold text-stone-900">
              {currentOrder.id}
            </p>
            <p>
              Status:{" "}
              <span className="font-medium text-amber-800">
                {currentOrder.status}
              </span>
            </p>
            <p className="text-[11px] text-stone-500">
              Placed on {currentOrder.datePlaced}
            </p>
            <p className="flex items-center gap-1 text-[11px] text-stone-500">
              <CreditCard className="h-3 w-3" />
              {currentOrder.paymentMethod} · {currentOrder.paymentStatus}
            </p>
          </CardContent>
        </Card>

        {/* Orders summary card */}
        <Card className="bg-white/90 border-stone-200/80 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-stone-700">
              Orders Summary
            </CardTitle>
            <History className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent className="text-xs text-stone-600 space-y-1">
            <p>
              <span className="font-semibold text-stone-900">
                {recentOrders.length}
              </span>{" "}
              orders in the last few months
            </p>
            <p className="text-[11px] text-stone-500">
              Track delivery, installation and past projects.
            </p>
          </CardContent>
        </Card>

        {/* Profile card */}
        <Card className="bg-white/90 border-stone-200/80 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-stone-700">
              Profile
            </CardTitle>
            <User className="h-4 w-4 text-amber-700" />
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-xs text-stone-600">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-700 text-amber-50 text-xs font-semibold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900">
                {displayName}
              </p>
              <p className="text-[11px] text-stone-500">
                Keep your contact info updated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        {/* Current order preview */}
        <Card className="bg-white/95 border-stone-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg text-stone-900">
                Current Order
              </CardTitle>
              <p className="text-xs text-stone-500 mt-1">
                Review items, payment and delivery details.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-stone-600">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="text-stone-400">Order ID: </span>
                <span className="font-mono font-semibold text-stone-900">
                  {currentOrder.id}
                </span>
              </span>
              <span>
                Status:{" "}
                <span className="font-semibold text-amber-800">
                  {currentOrder.status}
                </span>
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <Clock className="h-3 w-3" />
                {currentOrder.eta}
              </span>
            </div>

            <div className="grid gap-2 md:grid-cols-2 text-[11px]">
              <div>
                <p className="text-stone-500">Placed on</p>
                <p className="font-medium text-stone-900">
                  {currentOrder.datePlaced}
                </p>
              </div>
              <div>
                <p className="text-stone-500">Delivery window</p>
                <p className="font-medium text-stone-900">
                  {currentOrder.deliveryWindow}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <CreditCard className="h-3 w-3 text-amber-700" />
                <span className="text-stone-500">
                  {currentOrder.paymentMethod} ·{" "}
                  <span className="font-medium text-stone-900">
                    {currentOrder.paymentStatus}
                  </span>
                </span>
              </div>
              <div>
                <p className="text-stone-500">Payment reference</p>
                <p className="font-mono text-[11px] text-stone-900">
                  {currentOrder.paymentRef}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-stone-600 whitespace-pre-line">
              <MapPin className="h-4 w-4 mt-0.5 text-amber-700" />
              <p>{currentOrder.address}</p>
            </div>

            <div className="border rounded-xl border-stone-200/80 divide-y divide-stone-100 bg-stone-50/60">
              {currentOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Area: {item.area}
                    </p>
                  </div>
                  <p className="text-xs font-medium text-stone-700">
                    {item.qty}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-stone-500">Estimated total</span>
              <span className="font-semibold text-stone-900">
                {currentOrder.total}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions + new order */}
        <Card className="bg-white/95 border-stone-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-stone-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-700" />
              Start a New Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs md:text-sm text-stone-600">
            <p>
              Plan a new flooring project for another room or property. You can
              choose categories, compare finishes, and request a combined quote.
            </p>
            <Button className="w-full rounded-full text-sm">
              Create New Order
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <section className="mt-8">
        <Card className="bg-white/95 border-stone-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg text-stone-900">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-100 text-xs md:text-sm text-stone-600">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-medium text-stone-900">{order.id}</p>
                    <p className="text-[11px] text-stone-500">{order.date}</p>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <CreditCard className="h-3 w-3" />
                      {order.paymentMethod} · {order.paymentStatus}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-stone-900">
                      {order.total}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {order.itemsCount} item
                      {order.itemsCount > 1 ? "s" : ""}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-50 border border-stone-200 text-stone-600">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* ---------- Orders Tab ---------- */

function OrdersTab({ currentOrder, recentOrders }) {
  return (
    <div className="space-y-6">
      {/* Current order */}
      <Card className="bg-white/95 border-stone-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-stone-900 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-700" />
            Current Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs md:text-sm text-stone-600">
          <p className="font-mono font-semibold text-stone-900">
            {currentOrder.id}
          </p>
          <p>
            Status:{" "}
            <span className="font-semibold text-amber-800">
              {currentOrder.status}
            </span>
          </p>
          <p className="text-[11px] text-stone-500">
            Placed on {currentOrder.datePlaced}
          </p>
          <p className="text-[11px] text-stone-500 flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {currentOrder.paymentMethod} · {currentOrder.paymentStatus}
          </p>
          <p className="text-[11px] text-stone-500">
            Delivery window:{" "}
            <span className="font-medium text-stone-900">
              {currentOrder.deliveryWindow}
            </span>
          </p>
          <div className="border rounded-xl border-stone-200/80 divide-y divide-stone-100 bg-stone-50/60 mt-3">
            {currentOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Area: {item.area}
                  </p>
                </div>
                <p className="text-xs font-medium text-stone-700">
                  {item.qty}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-stone-500">Estimated total</span>
            <span className="font-semibold text-stone-900">
              {currentOrder.total}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Order history */}
      <Card className="bg-white/95 border-stone-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-stone-900 flex items-center gap-2">
            <History className="h-4 w-4 text-amber-700" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-stone-100 text-xs md:text-sm text-stone-600">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-medium text-stone-900">{order.id}</p>
                  <p className="text-[11px] text-stone-500">{order.date}</p>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <CreditCard className="h-3 w-3" />
                    {order.paymentMethod} · {order.paymentStatus}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-stone-900">
                    {order.total}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {order.itemsCount} item
                    {order.itemsCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-50 border border-stone-200 text-stone-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Profile Tab (editable UI only) ---------- */

function ProfileTab({ initials, profile, onProfileSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const handleStartEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const handleChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleSave = () => {
    onProfileSave(draft);
    setIsEditing(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      {/* Profile card */}
      <Card className="bg-white/95 border-stone-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg text-stone-900 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-700" />
            Profile Details
          </CardTitle>

          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="rounded-full text-xs flex items-center gap-1"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="rounded-full text-xs"
              >
                Save
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 text-xs md:text-sm text-stone-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-700 text-amber-50 text-sm font-semibold">
              {initials}
            </div>
            <div>
              <p className="font-medium text-stone-900">{profile.name}</p>
              <p className="text-[11px] text-stone-500">
                This is your customer account for Inscape Layers.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-1">
              <p className="text-[11px] text-stone-500">Full Name</p>
              {isEditing ? (
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  value={draft.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs">
                  {profile.name}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <p className="text-[11px] text-stone-500">Email</p>
              {isEditing ? (
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  value={draft.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                />
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs">
                  {profile.email}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <p className="text-[11px] text-stone-500">Phone</p>
              {isEditing ? (
                <input
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  value={draft.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                />
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs">
                  {profile.phone}
                </div>
              )}
            </div>

            {/* Preferred contact */}
            <div className="space-y-1">
              <p className="text-[11px] text-stone-500">Preferred Contact</p>
              {isEditing ? (
                <select
                  className="w-full rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  value={draft.preferredContact}
                  onChange={(e) =>
                    handleChange("preferredContact", e.target.value)
                  }
                >
                  <option>Email</option>
                  <option>Phone</option>
                  <option>WhatsApp</option>
                </select>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs">
                  {profile.preferredContact}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="bg-white/95 border-stone-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-stone-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-700" />
            Saved Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs md:text-sm text-stone-600">
          <p>
            Add your primary project address here to speed up quotes and
            deliveries.
          </p>

          {isEditing ? (
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-stone-200 bg-stone-50/60 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              value={draft.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Flat / House No, Street, City, Pincode"
            />
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50/60 px-3 py-3 text-[11px] text-stone-500 whitespace-pre-line">
              {profile.address || "No address added yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
