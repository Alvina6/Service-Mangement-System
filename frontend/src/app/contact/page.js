import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <span className="text-xs uppercase tracking-widest text-frost font-medium">Contact</span>
        <h1 className="font-display text-3xl font-semibold mt-2 mb-10">Get in touch</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="border border-graphite/10 rounded-2xl p-6 bg-white">
            <Phone size={20} className="text-frost mb-3" />
            <h3 className="font-medium mb-1">Call us</h3>
            <p className="text-sm text-slate">(800) 555-0142</p>
          </div>
          <div className="border border-graphite/10 rounded-2xl p-6 bg-white">
            <Mail size={20} className="text-frost mb-3" />
            <h3 className="font-medium mb-1">Email us</h3>
            <p className="text-sm text-slate">service@arcticair.com</p>
          </div>
          <div className="border border-graphite/10 rounded-2xl p-6 bg-white">
            <Clock size={20} className="text-frost mb-3" />
            <h3 className="font-medium mb-1">Emergency line</h3>
            <p className="text-sm text-slate">24/7 dispatch available</p>
          </div>
        </div>

        <form className="space-y-4 max-w-lg">
          <input placeholder="Your name" className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white" />
          <input type="email" placeholder="Email" className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white" />
          <textarea rows={4} placeholder="How can we help?" className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white" />
          <button type="submit" className="bg-frost hover:bg-frost-light text-ice px-6 py-3 rounded-full text-sm font-medium transition-colors">
            Send message
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
