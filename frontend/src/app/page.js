import Link from "next/link";
import { Wind, Thermometer, Wrench, ShieldCheck, Clock, ArrowRight, MapPin, Star, Phone, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GaugeDial from "@/components/GaugeDial";

const stats = [
  { value: 35, max: 40, label: "Technicians", sublabel: "Certified & insured" },
  { value: 98, max: 100, label: "On-Time %", sublabel: "Last 12 months" },
  { value: 24, max: 24, label: "Hr Response", sublabel: "Emergency dispatch" },
];

const services = [
  { icon: Wind, name: "Installation", desc: "New system sizing, install, and commissioning for homes and commercial spaces." },
  { icon: Wrench, name: "Repair", desc: "Diagnostics and same-week repair for AC units, furnaces, and ductwork." },
  { icon: Clock, name: "Emergency Service", desc: "24/7 dispatch when heating or cooling fails without warning." },
  { icon: Thermometer, name: "Maintenance Plans", desc: "Scheduled tune-ups that catch problems before they become breakdowns." },
];

const areas = ["Austin", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "Leander", "Kyle", "Buda", "Hutto", "Manor"];

const testimonials = [
  {
    name: "Sandra M.",
    city: "Austin, TX",
    rating: 5,
    text: "ArcticAir had a technician at my house within 3 hours of my emergency call. My AC was back running before dinner. Incredible service and the customer portal made tracking everything so easy.",
    plan: "Premium Plan Member",
  },
  {
    name: "James & Karen T.",
    city: "Round Rock, TX",
    rating: 5,
    text: "We've been on the Standard Maintenance Plan for two years now. The automatic reminders are great, and the technician always leaves detailed service notes we can review in the dashboard. Highly recommended.",
    plan: "Standard Plan Member",
  },
  {
    name: "Carlos R.",
    city: "Cedar Park, TX",
    rating: 5,
    text: "The quotation system is transparent and fast. I accepted the quote, paid through the portal, and got my new system installed all within 5 days. The before/after photos from the technician were a nice touch.",
    plan: "New Installation Customer",
  },
  {
    name: "Patricia L.",
    city: "Georgetown, TX",
    rating: 5,
    text: "As a commercial property manager, I need reliability. ArcticAir manages HVAC across 4 of my buildings. Their dashboard gives me visibility into every job and contract renewal — saves hours every month.",
    plan: "Commercial Client",
  },
];

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-graphite text-ice">
        <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ember-light font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-light animate-pulse" />
              24/7 Emergency Dispatch Available
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1] mb-6">
              Comfort, kept on schedule.
            </h1>
            <p className="text-slate-light text-lg leading-relaxed mb-8 max-w-md">
              ArcticAir installs, repairs, and maintains heating and cooling systems for homes and businesses —
              with a technician dispatched, a job tracked, and an invoice sent, all from one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/request-quote"
                className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-ice px-6 py-3 rounded-full text-sm font-medium transition-colors"
              >
                Request Service <ArrowRight size={16} />
              </Link>
              <Link
                href="/maintenance-plans"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-ice px-6 py-3 rounded-full text-sm font-medium transition-colors"
              >
                View Maintenance Plans
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-end gap-6">
            {stats.map((s) => (
              <GaugeDial key={s.label} {...s} size={148} stroke={9} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-xl mb-12">
          <span className="text-xs uppercase tracking-widest text-frost font-medium">What we do</span>
          <h2 className="font-display text-3xl font-semibold mt-2">Four ways we keep the temperature right</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.name} className="border border-graphite/10 bg-white rounded-2xl p-6 hover:shadow-md transition-shadow">
              <s.icon size={22} className="text-frost mb-4" strokeWidth={1.8} />
              <h3 className="font-display font-semibold mb-2">{s.name}</h3>
              <p className="text-sm text-slate leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Maintenance CTA */}
      <section className="bg-ice-dim">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <ShieldCheck size={28} className="text-mint mb-4" />
            <h2 className="font-display text-3xl font-semibold mb-4">
              Annual maintenance contracts that renew before you have to think about it
            </h2>
            <p className="text-slate leading-relaxed mb-6 max-w-md">
              Set a recurring visit schedule, get a reminder before your plan expires, and track every past
              tune-up from your customer dashboard.
            </p>
            <Link href="/maintenance-plans" className="text-frost font-medium text-sm inline-flex items-center gap-1.5">
              Compare plans <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { plan: "Basic", visits: "1 visit/yr", price: "$149" },
              { plan: "Standard", visits: "2 visits/yr", price: "$249" },
              { plan: "Premium", visits: "4 visits/yr", price: "$399" },
            ].map((p) => (
              <div key={p.plan} className="bg-white rounded-xl p-5 text-center border border-graphite/10">
                <div className="font-display font-semibold text-sm">{p.plan}</div>
                <div className="font-mono text-xl my-2 text-frost">{p.price}</div>
                <div className="text-xs text-slate">{p.visits}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-graphite text-ice">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-xl mb-12">
            <span className="text-xs uppercase tracking-widest text-frost font-medium">Testimonials</span>
            <h2 className="font-display text-3xl font-semibold mt-2">What our customers say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-light leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-ice">{t.name}</p>
                  <p className="text-xs text-slate-light mt-0.5">{t.city}</p>
                  <span className="text-[10px] uppercase tracking-wider text-frost font-medium mt-2 block">{t.plan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Services CTA */}
      <section className="bg-ember/5 border-y border-ember/15">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-ember/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={18} className="text-ember" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-graphite">HVAC Emergency? We dispatch 24/7.</h2>
              <p className="text-slate text-sm mt-1 max-w-lg">No heat, no cooling, or gas smell? Our emergency line is always open. Certified technicians on call around the clock.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <a href="tel:+18005550142" className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-ice px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              <Phone size={15} /> (800) 555-0142
            </a>
            <Link href="/emergency" className="inline-flex items-center gap-1.5 border border-ember/30 text-ember-dark px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-ember/5 transition-colors">
              Learn More <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section id="service-areas" className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center gap-2 mb-8">
          <MapPin size={18} className="text-ember" />
          <h2 className="font-display text-2xl font-semibold">Where we work</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {areas.map((a) => (
            <span key={a} className="text-sm border border-graphite/15 rounded-full px-4 py-2 text-slate">
              {a}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
