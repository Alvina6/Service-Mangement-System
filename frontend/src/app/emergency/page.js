import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Phone,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Thermometer,
  Wind,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "24/7 Dispatch — Always On",
    desc: "Our dispatch line never closes. Whether it's 2am on Christmas or a Sunday during a heatwave, a real dispatcher answers and a certified technician is en route.",
  },
  {
    icon: Zap,
    title: "Fast Response Times",
    desc: "Most emergency calls are met with on-site arrival within 2–4 hours. Priority dispatch is guaranteed for active maintenance plan holders.",
  },
  {
    icon: Shield,
    title: "Certified & Insured Technicians",
    desc: "Every emergency technician is NATE-certified, fully insured, and background-checked. You'll know who is coming before they arrive.",
  },
  {
    icon: CheckCircle,
    title: "All Systems Covered",
    desc: "We handle emergency failures for all system types — central AC, heat pumps, gas furnaces, mini-splits, ductless systems, and commercial HVAC units.",
  },
];

const emergencyTypes = [
  { icon: Wind, label: "No Cooling (AC Failure)", color: "text-frost" },
  { icon: Thermometer, label: "No Heat (Furnace Failure)", color: "text-ember" },
  { icon: AlertTriangle, label: "Gas Smell / Leak Concern", color: "text-ember-dark" },
  { icon: Zap, label: "Electrical / Circuit Failure", color: "text-amber-500" },
  { icon: Wind, label: "Refrigerant / Freon Leak", color: "text-frost" },
  { icon: Thermometer, label: "Frozen Evaporator Coil", color: "text-frost-light" },
];

const steps = [
  { step: "01", title: "Call or Submit Online", desc: "Call our 24/7 emergency line or submit a request online. Mark it as Emergency for priority routing." },
  { step: "02", title: "Dispatcher Confirms", desc: "A live dispatcher confirms your request within minutes and assigns the nearest available certified technician." },
  { step: "03", title: "Technician En Route", desc: "Your technician is dispatched immediately. You'll receive their name and status in your customer portal." },
  { step: "04", title: "System Restored", desc: "The technician diagnoses and repairs the issue on-site. A service report and invoice are sent once complete." },
];

export default function EmergencyServicesPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="bg-graphite text-ice relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ember/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-ember/20 border border-ember/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-ember-light">
                24/7 Emergency Dispatch Active
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-6">
              HVAC Emergency?<br />We respond around the clock.
            </h1>
            <p className="text-slate-light text-lg leading-relaxed mb-8 max-w-xl">
              When your heating or cooling system fails, every minute matters — especially in extreme
              heat or cold. ArcticAir dispatches certified technicians 24 hours a day, 7 days a week,
              365 days a year.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="tel:+18005550142"
                className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-ice px-6 py-3 rounded-full text-sm font-semibold transition-colors shadow-lg"
              >
                <Phone size={16} /> Call (800) 555-0142 Now
              </a>
              <Link
                href="/request-quote"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-ice px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              >
                Submit Emergency Request <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Types */}
      <section className="bg-ice-dim">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-frost font-medium">Covered Emergencies</span>
            <h2 className="font-display text-3xl font-semibold mt-2">What counts as an emergency?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyTypes.map((e) => (
              <div key={e.label} className="flex items-center gap-4 bg-white border border-graphite/10 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <e.icon size={22} className={e.color} strokeWidth={1.8} />
                <span className="text-sm font-semibold text-graphite">{e.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate mt-6">
            Not sure if it counts? Call us anyway — we never charge for emergency consultations.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <span className="text-xs uppercase tracking-widest text-frost font-medium">Why ArcticAir</span>
          <h2 className="font-display text-3xl font-semibold mt-2">Emergency service you can rely on</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-graphite/10 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <f.icon size={22} className="text-frost mb-4" strokeWidth={1.8} />
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-graphite text-ice">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-frost font-medium">The Process</span>
            <h2 className="font-display text-3xl font-semibold mt-2">How emergency dispatch works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-ember/20 border border-ember/30 flex items-center justify-center mx-auto mb-4">
                  <span className="font-mono font-bold text-ember-light text-sm">{s.step}</span>
                </div>
                <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <AlertTriangle size={32} className="text-ember mx-auto mb-4" />
        <h2 className="font-display text-3xl font-semibold mb-3">Experiencing an emergency right now?</h2>
        <p className="text-slate max-w-xl mx-auto mb-8">
          Don&apos;t wait. Call our direct emergency line and a live dispatcher will assign your technician immediately.
          Alternatively, log in and submit an emergency request from your customer portal.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="tel:+18005550142"
            className="bg-ember hover:bg-ember-light text-ice text-sm font-semibold px-8 py-3 rounded-full transition-colors shadow-md flex items-center gap-2"
          >
            <Phone size={16} /> (800) 555-0142 — Call Now
          </a>
          <Link
            href="/request-quote"
            className="border border-graphite/20 hover:border-graphite/40 text-graphite text-sm font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Submit Online Request
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
