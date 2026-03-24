// ─────────────────────────────────────────────────────────────────────────────
// components/InputField.jsx
//
// WHY THIS EXISTS:
// BuyAll.jsx and BuyNow.jsx both defined an identical InputField component
// at the bottom of their files. Any style change had to be made twice.
// Now it lives here — one component, used everywhere.
//
// HOW TO USE:
//   import InputField from "../components/InputField";
//   <InputField label="Full Name" name="fullName" value={...} onChange={...}
//               error={visibleErrors.fullName} success={touched.fullName && !errors.fullName} />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

const InputField = ({
  label,
  error,
  success,
  isOptional = false,
  hint,
  className = "",
  ...props
}) => {
  const borderClass = error
    ? "border-red-400 ring-2 ring-red-50 bg-red-50/30"
    : success
    ? "border-emerald-400 ring-2 ring-emerald-50"
    : "border-stone-200 bg-stone-50 focus:border-amber-500";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          {label}
          {!isOptional && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        className={`w-full h-12 px-4 border rounded-xl text-sm outline-none transition-all ${borderClass} ${className}`}
      />
      {error ? (
        <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span>!</span> {error}
        </p>
      ) : success ? (
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
          <span>✓</span> Looks good
        </p>
      ) : hint ? (
        <p className="text-[10px] text-stone-400 tracking-wide">{hint}</p>
      ) : null}
    </div>
  );
};

export default InputField;