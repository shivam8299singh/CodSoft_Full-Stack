import {
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UtensilsCrossed,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold font-serif text-white tracking-tight">
                Dine<span className="text-amber-500">Desk</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Digitizing dining hospitality with handcrafted cuisine, seamless table bookings, and instant kitchen delivery workflows.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-900/60 px-3 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              Certified Gourmet Food & Safety
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">
              Explore DineDesk
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu" className="hover:text-amber-400 transition">
                  Our Digital Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-amber-400 transition">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-400 transition">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition">
                  Our Culinary Story
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Staff & Kitchen Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Monday — Friday</p>
                  <p className="text-xs text-slate-400">11:00 AM — 11:00 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Saturday — Sunday</p>
                  <p className="text-xs text-slate-400">10:30 AM — 11:30 PM</p>
                </div>
              </li>
              <li className="text-xs text-amber-500/90 pt-1">
                Kitchen closes 30 minutes prior to restaurant closing.
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-sans">
              Contact & Location
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>42 Gourmet Boulevard, Connaught Circle, Metropolis - 110001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>reservations@dinedesk.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DineDesk Restaurant Platform. CodSoft Internship Task 2.</p>
          <p className="flex items-center gap-1.5">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Gastronomy & Technology
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
