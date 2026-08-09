import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$149/yr",
    visits: "1 visit / year",
    features: ["Full system inspection", "Filter replacement", "Priority booking"],
  },
  {
    name: "Standard",
    price: "$249/yr",
    visits: "2 visits / year",
    features: ["Everything in Basic", "Seasonal tune-up (spring + fall)", "10% off repairs"],
    highlight: true,
  },
  {
    name: "Premium",
    price: "$399/yr",
    visits: "4 visits / year",
    features: ["Everything in Standard", "Quarterly tune-ups", "No emergency dispatch fee", "20% off repairs"],
  },
];

export default function MaintenancePlansPage() {
  return (
    <main>
      <Navbar />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <span className="text-xs uppercase tracking-widest text-frost font-medium">Maintenance Plans</span>
        <h1 className="font-display text-3xl font-semibold mt-2 mb-4">Recurring visits, automatic reminders</h1>
        <p className="text-slate max-w-xl mb-12">
          Every plan is tracked from your customer dashboard — see your next visit date, renewal date, and full
          service history in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border ${
                p.highlight ? "border-frost bg-graphite text-ice" : "border-graphite/10 bg-white"
              }`}
            >
              <h3 className="font-display font-semibold text-lg mb-1">{p.name}</h3>
              <div className={`font-mono text-3xl my-4 ${p.highlight ? "text-frost-light" : "text-frost"}`}>
                {p.price}
              </div>
              <p className={`text-sm mb-6 ${p.highlight ? "text-slate-light" : "text-slate"}`}>{p.visits}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={p.highlight ? "text-mint-light mt-0.5" : "text-mint mt-0.5"} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center text-sm font-medium py-2.5 rounded-full transition-colors ${
                  p.highlight ? "bg-frost hover:bg-frost-light text-ice" : "bg-graphite hover:bg-graphite-light text-ice"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
