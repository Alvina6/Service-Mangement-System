import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Snowflake,
  ShieldCheck,
  Users,
  Clock,
  MapPin,
  Award,
  ThumbsUp,
  Wrench,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Licensed & Insured",
    desc: "Every technician on our roster is fully licensed, insured, and certified to work on residential and commercial HVAC systems.",
  },
  {
    icon: Clock,
    title: "24/7 Emergency Dispatch",
    desc: "We run round-the-clock dispatch so your home or business is never left without heating or cooling for more than a few hours.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    desc: "We stand behind every job. If you're not satisfied with the work, we'll come back and make it right — no questions asked.",
  },
  {
    icon: Award,
    title: "Certified Specialists",
    desc: "Our technicians hold NATE certifications and manufacturer training for all major brands — Carrier, Lennox, Trane, and more.",
  },
];

const stats = [
  { value: "35+", label: "Certified Technicians" },
  { value: "12", label: "Service Areas" },
  { value: "98%", label: "On-Time Arrival Rate" },
  { value: "5,000+", label: "Jobs Completed" },
];

const team = [
  {
    name: "Marcus Webb",
    role: "Founder & CEO",
    bio: "20+ years in residential and commercial HVAC. Marcus founded ArcticAir to bring operational transparency and modern scheduling to the industry.",
  },
  {
    name: "Danielle Torres",
    role: "Head of Operations",
    bio: "Oversees daily dispatch, technician scheduling, and quality control. Danielle built the processes that keep our 98% on-time record intact.",
  },
  {
    name: "Carlos Reyes",
    role: "Senior HVAC Technician",
    bio: "NATE-certified with 15 years of field experience. Carlos trains new technicians and leads our most complex commercial installations.",
  },
  {
    name: "Priya Nair",
    role: "Customer Experience Manager",
    bio: "Ensures every customer interaction is smooth, from the first inquiry to the final invoice. Priya manages our service portal and feedback programs.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="bg-graphite text-ice">
        <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-frost font-medium mb-4 block">
              About ArcticAir
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-6">
              Keeping comfort running since day one.
            </h1>
            <p className="text-slate-light text-lg leading-relaxed max-w-lg">
              ArcticAir HVAC Solutions provides professional heating, ventilation, and air conditioning
              services across the United States. With 35+ certified technicians and a fleet covering
              12 metro areas, we combine technology and craftsmanship to deliver reliable comfort.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm"
              >
                <div className="font-display text-4xl font-bold text-frost mb-1">{s.value}</div>
                <div className="text-xs text-slate-light uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Snowflake size={32} className="text-frost mb-5" strokeWidth={1.5} />
            <h2 className="font-display text-3xl font-semibold mb-4">
              Our mission
            </h2>
            <p className="text-slate leading-relaxed mb-4">
              We started ArcticAir because we saw how fragmented the HVAC industry was. Customers
              couldn&apos;t track their service requests. Technicians were working from spreadsheets.
              Invoices took days to generate. We built a platform to fix all of that.
            </p>
            <p className="text-slate leading-relaxed">
              Today, every service request, quotation, technician dispatch, and invoice lives in
              one centralized system — accessible to customers, technicians, and management alike.
              Our goal is simple: make HVAC service as easy to manage as sending an email.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="border border-graphite/10 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow"
              >
                <v.icon size={20} className="text-frost mb-3" strokeWidth={1.8} />
                <h3 className="font-display font-semibold text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-slate leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-ice-dim">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={18} className="text-ember" />
            <h2 className="font-display text-2xl font-semibold">Where we operate</h2>
          </div>
          <p className="text-slate max-w-xl mb-8">
            We service residential and commercial properties across 12 cities in Texas and growing.
            Our technicians are local — they live and work in the same communities they serve.
          </p>
          <div className="flex flex-wrap gap-3">
            {["Austin", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "Leander",
              "Kyle", "Buda", "San Marcos", "Hutto", "Manor", "Bastrop"].map((city) => (
              <span
                key={city}
                className="text-sm border border-graphite/15 rounded-full px-4 py-2 text-slate bg-white"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <span className="text-xs uppercase tracking-widest text-frost font-medium">The Team</span>
        <h2 className="font-display text-3xl font-semibold mt-2 mb-10">
          People behind the promise
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-graphite/10 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-graphite/10 flex items-center justify-center mb-4">
                <Users size={20} className="text-graphite/40" />
              </div>
              <h3 className="font-display font-semibold text-sm">{member.name}</h3>
              <p className="text-xs text-frost font-medium mt-0.5 mb-3">{member.role}</p>
              <p className="text-xs text-slate leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-graphite text-ice">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Wrench size={28} className="text-frost mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-display text-3xl font-semibold mb-4">
            Why customers choose ArcticAir
          </h2>
          <p className="text-slate-light max-w-2xl mx-auto leading-relaxed mb-10">
            We&apos;re not the biggest HVAC company — we&apos;re the most accountable. Every job is tracked,
            every technician is rated, and every invoice is transparent. That&apos;s how we maintain a
            98% on-time record and a 4.9-star average across all service areas.
          </p>
          <a
            href="/request-quote"
            className="inline-block bg-ember hover:bg-ember-light text-ice px-8 py-3 rounded-full text-sm font-semibold transition-colors"
          >
            Request a Free Estimate
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
