// ─────────────────────────────────────────────────────────────────────────────
// utils/validators.js
//
// WHY THIS EXISTS:
// BuyAll.jsx and BuyNow.jsx had IDENTICAL copies of:
//   - VALIDATORS object
//   - validateAll function
//   - hasErrors function
//   - InputField component
//
// This means any bug fix or rule change had to be made in TWO places.
// Now there's ONE source of truth — fix here, works everywhere.
//
// HOW TO USE:
//   import { SHIPPING_VALIDATORS, validateAll, hasErrors } from "../utils/validators";
// ─────────────────────────────────────────────────────────────────────────────

// ── Shipping address validators ──────────────────────────────────────────────
export const SHIPPING_VALIDATORS = {
  fullName: (v) => {
    if (!v?.trim()) return "Full name is required";
    if (v.trim().length < 3) return "Name must be at least 3 characters";
    if (v.trim().length > 60) return "Name must be under 60 characters";
    if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) return "Name must contain only letters";
    return "";
  },
  contact: (v) => {
    const digits = (v || "").replace(/\D/g, "");
    if (!digits) return "Contact number is required";
    if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number";
    return "";
  },
  pincode: (v) => {
    if (!v?.trim()) return "Pincode is required";
    if (!/^\d{6}$/.test(v.trim())) return "Enter a valid 6-digit pincode";
    if (/^0{6}$/.test(v.trim())) return "Enter a valid pincode";
    return "";
  },
  landmark: () => "",  // always optional
  address: (v) => {
    if (!v?.trim()) return "Delivery address is required";
    if (v.trim().length < 15) return "Please enter a more complete address (min 15 chars)";
    if (v.trim().length > 300) return "Address is too long (max 300 chars)";
    return "";
  },
};

/**
 * Run all validators against a form object.
 * Returns an object with the same keys, each containing error string or "".
 *
 * @param {object} form - The form state object
 * @param {object} validators - The validators object to use
 * @returns {object} errors
 */
export const validateAll = (form, validators = SHIPPING_VALIDATORS) =>
  Object.fromEntries(
    Object.entries(validators).map(([key, fn]) => [key, fn(form[key] ?? "")])
  );

/**
 * Returns true if any error string is non-empty.
 * @param {object} errors
 * @returns {boolean}
 */
export const hasErrors = (errors) => Object.values(errors).some(Boolean);

/**
 * Filter errors to only show touched fields.
 * @param {object} errors - full errors object
 * @param {object} touched - which fields have been interacted with
 * @returns {object} visible errors
 */
export const getVisibleErrors = (errors, touched) =>
  Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [k, touched[k] ? v : ""])
  );

// ── Status config — shared across OrderHistory, Orders, OrderDetails ─────────
// OLD: each file had its own statusConfig/statusStyles object with "cancel" key
// NEW: one config, uses "cancelled" to match the backend fix
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Processing",
    style: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  arriving: {
    label: "Out for Delivery",
    style: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  delivered: {
    label: "Delivered",
    style: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    style: "bg-red-50 text-red-700 border border-red-100",
  },
};

/**
 * Get status config — falls back gracefully for unknown statuses.
 * Handles "cancel" → "cancelled" mapping for old orders in DB.
 */
export const getStatusConfig = (status) => {
  // Handle legacy "cancel" value from old orders
  const normalized = status?.toLowerCase() === "cancel" ? "cancelled" : status?.toLowerCase();
  return ORDER_STATUS_CONFIG[normalized] || {
    label: status || "Unknown",
    style: "bg-stone-100 text-stone-500 border border-stone-200",
  };
};