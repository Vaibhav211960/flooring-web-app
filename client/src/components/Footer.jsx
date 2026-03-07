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
  CreditCard,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="container max-w-7xl mx-auto px-6 py-16">

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pt-14">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-stone-900 rounded-sm flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xs">I</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Inscape Layers
              </h3>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              Premium flooring, direct from manufacturers to your home.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50 transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[10px] font-bold text-stone-900 mb-5 uppercase tracking-widest">
              Collections
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li>
                <Link
                  to="/products?category=hardwood"
                  className="hover:text-amber-800 transition-colors"
                >
                  Hardwood Flooring
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=vinyl"
                  className="hover:text-amber-800 transition-colors"
                >
                  Luxury Vinyl Plank
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=laminate"
                  className="hover:text-amber-800 transition-colors"
                >
                  Premium Laminate
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-bold text-stone-900 mb-5 uppercase tracking-widest">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-amber-800 transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-amber-800 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-amber-800 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold text-stone-900 mb-5 uppercase tracking-widest">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-stone-500">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  123 Market Square,
                  <br />
                  Ahmedabad, GJ 380001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-amber-700 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-amber-700 shrink-0" />
                <span>sales@inscapefloors.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-stone-200 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Inscape Layers. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5 text-stone-400">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest">
                Secure Payments
              </span>
            </div>
            <Link
              to="/privacy"
              className="text-[10px] uppercase tracking-widest hover:text-stone-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-[10px] uppercase tracking-widest hover:text-stone-700 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}