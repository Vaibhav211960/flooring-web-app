import React from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Button } from "../ui/button.jsx";
import { Mail, Phone, MapPin, Clock, MessageSquare, ArrowRight, Instagram, Linkedin } from "lucide-react";

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Integration logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />

      {/* --- Architectural Hero --- */}
      <section className="bg-stone-900 text-stone-50 border-b border-amber-900/20">
        <div className="container max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-amber-500 font-bold mb-4">
              Project Consultation
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Let&apos;s plan your <br />
              <span className="italic text-amber-500">next space.</span>
            </h1>
            <p className="text-sm md:text-lg text-stone-400 max-w-2xl leading-relaxed font-light">
              Whether you are a homeowner, architect, or developer, we provide the technical 
              expertise and aesthetic guidance needed to ground your vision.
            </p>
          </div>
        </div>
      </section>

      {/* --- Contact Content --- */}
      <main className="flex-grow py-20 md:py-32">
        <div className="container max-w-7xl mx-auto px-6 grid gap-16 lg:grid-cols-12">
          
          {/* Left: Contact Info & Manifest */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-6 text-stone-900">The Studio</h2>
              <p className="text-stone-500 text-sm md:text-base leading-relaxed mb-8">
                Visit our experience center to feel the textures and see how our 
                collections react to different lighting environments.
              </p>
              
              <div className="space-y-6">
                <ContactDetail 
                  icon={<MapPin size={18}/>} 
                  label="Office & Gallery" 
                  value="123 Design District, Floor City, FC 90210" 
                />
                <ContactDetail 
                  icon={<Phone size={18}/>} 
                  label="Direct Line" 
                  value="+1 (555) 123-4567" 
                />
                <ContactDetail 
                  icon={<Mail size={18}/>} 
                  label="General Inquiry" 
                  value="hello@inscapefloors.com" 
                />
                <ContactDetail 
                  icon={<Clock size={18}/>} 
                  label="Studio Hours" 
                  value="Mon – Sat, 10:00 AM – 7:00 PM" 
                />
              </div>
            </div>

            {/* Social Connect */}
            <div className="pt-8 border-t border-stone-200 flex items-center gap-6">
              <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Follow our craft</p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><Instagram size={16}/></a>
                <a href="#" className="h-10 w-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"><Linkedin size={16}/></a>
              </div>
            </div>
          </div>

          {/* Right: Modern Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone-200 p-8 md:p-12 shadow-xl shadow-stone-200/50">
              <div className="mb-10">
                <h3 className="font-serif text-2xl font-bold mb-2">Send a Manifest</h3>
                <p className="text-xs text-stone-400 font-medium">ESTIMATED RESPONSE TIME: 24 HOURS</p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Full Name" placeholder="John Doe" required />
                  <InputField label="Email Address" type="email" placeholder="john@example.com" required />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-1">Project Type</label>
                    <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none appearance-none">
                      <option>Residential Renovation</option>
                      <option>Commercial Space</option>
                      <option>New Build</option>
                      <option>Bulk/Wholesale Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-1">Project Details</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none resize-none"
                    placeholder="Describe your space, square footage, and desired aesthetic..."
                  />
                </div>

                <Button className="w-full h-14 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all group">
                  Submit Project Inquiry <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

/** --- Internal Sub-Components --- **/

function ContactDetail({ icon, label, value }) {
  return (
    <div className="flex gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">{label}</p>
        <p className="text-sm font-medium text-stone-700">{value}</p>
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 ml-1">{label}</label>
      <input 
        {...props}
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none"
      />
    </div>
  );
}