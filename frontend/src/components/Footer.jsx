import Link from "next/link";
import { Snowflake, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-graphite-dark border-t border-white/10 text-slate-light">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-ice mb-3">
            <Snowflake size={18} className="text-frost-light" />
            ArcticAir
          </div>
          <p className="text-sm leading-relaxed">
            Residential and commercial HVAC installation, repair, and maintenance — trusted across the region since day one.
          </p>
        </div>

        <div>
          <h4 className="text-ice text-sm font-medium mb-3">Services</h4>
          <ul className="text-sm space-y-2">
            <li><Link href="/services" className="hover:text-ice transition-colors">Installation</Link></li>
            <li><Link href="/services" className="hover:text-ice transition-colors">Repair</Link></li>
            <li><Link href="/emergency" className="hover:text-ice transition-colors">Emergency Service</Link></li>
            <li><Link href="/maintenance-plans" className="hover:text-ice transition-colors">Maintenance Plans</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ice text-sm font-medium mb-3">Company</h4>
          <ul className="text-sm space-y-2">
            <li><Link href="/about" className="hover:text-ice transition-colors">About Us</Link></li>
            <li><Link href="/#service-areas" className="hover:text-ice transition-colors">Service Areas</Link></li>
            <li><Link href="/faq" className="hover:text-ice transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-ice transition-colors">Contact</Link></li>
            <li><Link href="/login" className="hover:text-ice transition-colors">Customer Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-ice text-sm font-medium mb-3">Get in touch</h4>
          <ul className="text-sm space-y-3">
            <li className="flex items-center gap-2"><Phone size={14} className="text-ember-light" /> (800) 555-0142</li>
            <li className="flex items-center gap-2"><Mail size={14} className="text-ember-light" /> service@arcticair.com</li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-ember-light" /> Serving 12 metro areas</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-light/70">
        © {new Date().getFullYear()} ArcticAir HVAC Solutions. All rights reserved.
      </div>
    </footer>
  );
}
