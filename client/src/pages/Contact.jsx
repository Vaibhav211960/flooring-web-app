import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Instagram,
  Linkedin,
  Home as HomeIcon,
  ChevronRight,
} from "lucide-react";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Integration logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-16 md:py-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-8">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <HomeIcon className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-700" />
            <span className="text-amber-500">Contact</span>
          </nav>

          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-3">
              Project Consultation
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Let's plan your{" "}
              <span className="italic text-amber-400">next space.</span>
            </h1>
            <p className="text-sm md:text-lg text-stone-400 max-w-2xl leading-relaxed font-light">
              Whether you are a homeowner, architect, or developer, we provide
              the technical expertise and aesthetic guidance needed to ground
              your vision.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Content ── */}
      <main className="flex-grow py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-6 grid gap-16 lg:grid-cols-12">

          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6 text-stone-900">
                The Studio
              </h2>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8">
                Visit our experience center to feel the textures and see how
                our collections react to different lighting environments.
              </p>

              <div className="space-y-6">
                <ContactDetail
                  icon={<MapPin size={18} />}
                  label="Office & Gallery"
                  value="123 Market Square, Ahmedabad, GJ 380001"
                />
                <ContactDetail
                  icon={<Phone size={18} />}
                  label="Direct Line"
                  value="+91 98765 43210"
                />
                <ContactDetail
                  icon={<Mail size={18} />}
                  label="General Inquiry"
                  value="sales@inscapefloors.com"
                />
                <ContactDetail
                  icon={<Clock size={18} />}
                  label="Studio Hours"
                  value="Mon – Sat, 10:00 AM – 7:00 PM"
                />
              </div>
            </div>

            {/* Social */}
            <div className="pt-8 border-t border-stone-200 flex items-center gap-6">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                Follow our craft
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all"
                >
                  <Linkedin size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-stone-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">
                  Send a Manifest
                </p>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                  Estimated Response Time: 24 Hours
                </p>
              </div>

              <div className="p-8">
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField label="Full Name" placeholder="John Doe" required />
                    <InputField
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                        Project Type
                      </label>
                      <select className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all appearance-none">
                        <option>Residential Renovation</option>
                        <option>Commercial Space</option>
                        <option>New Build</option>
                        <option>Bulk / Wholesale Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
                      Project Details
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all resize-none"
                      placeholder="Describe your space, square footage, and desired aesthetic..."
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full h-12 bg-stone-900 text-white hover:bg-stone-800 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Submit Project Inquiry
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
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

function ContactDetail({ icon, label, value }) {
  return (
    <div className="flex gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
          {label}
        </p>
        <p className="text-sm font-medium text-stone-700">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">
        {label}
      </label>
      <input
        {...props}
        className="w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:border-amber-500 focus:outline-none transition-all"
      />
    </div>
  );
}