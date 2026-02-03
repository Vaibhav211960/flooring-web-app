import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="container max-w-7xl mx-auto px-6 md:px-12 py-16">
        
        {/* Top Section: Newsletter or Value Prop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-16 border-b border-stone-200">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold text-stone-900 mb-2">Join the Inscape Inner Circle</h3>
            <p className="text-stone-600 mb-6 max-w-md">Receive expert flooring tips, design inspiration, and exclusive offers delivered to your inbox.</p>
            <div className="flex max-w-md gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-md border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 transition-all bg-white"
              />
              <button className="bg-stone-900 text-white px-6 py-3 rounded-md hover:bg-stone-800 transition-colors flex items-center gap-2">
                Join <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 bg-amber-50/50 p-6 rounded-xl border border-amber-100">
             <div className="flex items-center gap-3 text-amber-900">
                <ShieldCheck className="w-6 h-6" />
                <span className="font-medium">Industry Certified Quality</span>
             </div>
             <p className="text-xs text-stone-600 leading-relaxed">
               All our products meet rigorous durability standards and come with full manufacturer warranties.
             </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 pt-16">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-stone-900 rounded-sm flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xs">I</span>
              </div>
              <h3 className="font-serif text-xl font-bold tracking-tight text-stone-900">
                Inscape Layers
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-stone-500">
              Direct-to-consumer premium flooring. We bridge the gap between global manufacturers and your home.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-amber-800 hover:border-amber-700 hover:bg-amber-50 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-6 uppercase text-xs tracking-widest">Collections</h4>
            <ul className="space-y-4 text-sm text-stone-600">
              <li><Link to="/products?category=hardwood" className="hover:text-amber-800 transition-colors">Hardwood Flooring</Link></li>
              <li><Link to="/products?category=vinyl" className="hover:text-amber-800 transition-colors">Luxury Vinyl Plank</Link></li>
              <li><Link to="/products?category=laminate" className="hover:text-amber-800 transition-colors">Premium Laminate</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-6 uppercase text-xs tracking-widest">Customer Support</h4>
            <ul className="space-y-4 text-sm text-stone-600">
              <li><Link to="/shipping" className="hover:text-amber-800 transition-colors">Shipping Policy</Link></li>
              <li><Link to="/faq" className="hover:text-amber-800 transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-amber-800 transition-colors">Contact Expert</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-6 uppercase text-xs tracking-widest">Get In Touch</h4>
            <ul className="space-y-4 text-sm text-stone-600">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-700 shrink-0" />
                <span>123 Market Square,<br />Ahmedabad, GJ 380001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-700 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-700 shrink-0" />
                <span>sales@inscapefloors.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Inscape Layers. Engineered for life.
          </p>
          <div className="flex items-center gap-6 text-stone-400">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">Secure Payments</span>
            </div>
            <Link to="/privacy" className="text-[10px] uppercase tracking-widest hover:text-stone-900">Privacy Policy</Link>
            <Link to="/terms" className="text-[10px] uppercase tracking-widest hover:text-stone-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}