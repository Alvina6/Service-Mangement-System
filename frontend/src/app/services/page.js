import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Wind, Wrench, Clock, Thermometer, Fan, Droplets } from "lucide-react";
import Link from "next/link";

const services = [
  { icon: Wind, name: "Installation", desc: "Full system sizing, installation, and commissioning for new construction or replacements — residential and commercial." },
  { icon: Wrench, name: "Repair", desc: "Diagnostics and repair for AC units, furnaces, heat pumps, and ductwork, backed by certified technicians." },
  { icon: Clock, name: "Emergency Service", desc: "24/7 dispatch for no-heat and no-cool emergencies, with priority scheduling for active contract holders." },
  { icon: Thermometer, name: "Maintenance Plans", desc: "Scheduled tune-ups on a recurring basis, with automatic renewal reminders before your plan expires." },
  { icon: Fan, name: "Duct Cleaning", desc: "Full duct inspection and cleaning to improve airflow and indoor air quality." },
  { icon: Droplets, name: "Thermostat Installation", desc: "Smart and programmable thermostat installation and configuration." },
];

export default function ServicesPage() {
  return (
    <main>
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <span className="text-xs uppercase tracking-widest text-frost font-medium">Services</span>
        <h1 className="font-display text-3xl font-semibold mt-2 mb-10">Everything your HVAC system needs</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.name} className="border border-graphite/10 rounded-2xl p-6 bg-white">
              <s.icon size={22} className="text-frost mb-4" strokeWidth={1.8} />
              <h3 className="font-display font-semibold mb-2">{s.name}</h3>
              <p className="text-sm text-slate leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/request-quote" className="inline-block bg-ember hover:bg-ember-light text-ice px-6 py-3 rounded-full text-sm font-medium transition-colors">
            Request a quote
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
