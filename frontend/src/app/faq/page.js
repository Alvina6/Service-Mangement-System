"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    category: "Services & Scheduling",
    items: [
      {
        q: "What services does ArcticAir offer?",
        a: "We offer HVAC installation (residential and commercial), system repair, 24/7 emergency dispatch, duct cleaning, thermostat installation, and annual maintenance contracts. All services can be requested directly through our online portal.",
      },
      {
        q: "How do I request a service or book an inspection?",
        a: "Simply click 'Request Service' from the homepage or log in to your Customer Dashboard. You can submit the type of service needed, upload photos of the issue, and select your preferred date. Our dispatch team will assign a technician and confirm your appointment.",
      },
      {
        q: "How quickly can a technician arrive?",
        a: "For standard service requests, we typically schedule within 24–48 hours. For emergency service calls, we dispatch within hours — 24/7, including weekends and holidays. Premium maintenance plan holders receive priority dispatch.",
      },
      {
        q: "Can I track my technician's status in real time?",
        a: "Yes. Once a technician is assigned to your job, you can track the job status directly from your Customer Dashboard: Scheduled → En Route → In Progress → Completed. You'll also receive in-app notifications at each stage.",
      },
      {
        q: "What areas do you serve?",
        a: "We currently serve 12 cities including Austin, Round Rock, Cedar Park, Georgetown, Pflugerville, Leander, Kyle, Buda, San Marcos, Hutto, Manor, and Bastrop. We are expanding continuously — contact us to check availability in your area.",
      },
    ],
  },
  {
    category: "Quotations & Billing",
    items: [
      {
        q: "How does the quotation process work?",
        a: "After you submit a service request, our dispatcher will review the details and generate a detailed quotation including labor costs, equipment, taxes, and any applicable discounts. You'll receive the quote in your Customer Dashboard and can accept or decline it digitally.",
      },
      {
        q: "Can I negotiate or ask for changes to a quote?",
        a: "Absolutely. If you have questions about a line item or want to discuss the scope of work, contact our support team directly. We can revise and resend a quote before it's finalized.",
      },
      {
        q: "How and when is an invoice generated?",
        a: "An invoice is generated automatically by our admin team once your quotation has been accepted and the job is completed. You'll receive a notification in your dashboard and can view, print, or pay the invoice directly from the portal.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept major credit and debit cards through our secure online portal. We also accept ACH bank transfers, checks, and cash payments (recorded by your service technician). Payment history is always available in your dashboard.",
      },
      {
        q: "What if I have a dispute about my invoice?",
        a: "Contact our billing team at billing@arcticair.com or call (800) 555-0142. We'll review the invoice and resolve the issue within 2 business days.",
      },
    ],
  },
  {
    category: "Maintenance Plans",
    items: [
      {
        q: "What maintenance plans do you offer?",
        a: "We offer three annual plans: Basic ($149/yr — 1 visit), Standard ($249/yr — 2 visits), and Premium ($399/yr — 4 visits). All plans include system inspections, filter replacements, and priority booking. Higher tiers include discounts on repairs and no emergency dispatch fees.",
      },
      {
        q: "How do I sign up for a maintenance plan?",
        a: "Visit our Maintenance Plans page and click 'Get Started', or ask your service technician to set one up during your next visit. An admin will configure the contract and send it to your dashboard for review.",
      },
      {
        q: "Will I be reminded before my plan expires?",
        a: "Yes. Our system automatically detects contracts expiring within 30 days and sends you an in-app notification and email reminder. You can renew with a single click directly from your Customer Dashboard.",
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, you can change your maintenance plan at the time of renewal. Contact our support team before your renewal date and we'll adjust your plan and pricing for the next year.",
      },
      {
        q: "Are maintenance visits tracked?",
        a: "Every scheduled maintenance visit is tracked in your Customer Dashboard — including the date, the technician who performed it, service notes, and before/after photos uploaded by the technician.",
      },
    ],
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "Is my data secure?",
        a: "Yes. All data in transit is protected by HTTPS/TLS encryption. Passwords are hashed using bcrypt and never stored in plain text. Our API is protected with JWT authentication, and all requests are validated and sanitized on the server to prevent injection attacks.",
      },
      {
        q: "How do I reset my password?",
        a: "On the login page, click 'Forgot Password' and enter your email address. You'll receive a secure reset link within a few minutes. If you don't see it, check your spam folder or contact support@arcticair.com.",
      },
      {
        q: "Can I have multiple users under one account?",
        a: "Currently, each account represents a single user. For commercial clients needing multi-user access, contact our support team to discuss a custom account arrangement.",
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-graphite/10 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between px-5 py-4 hover:bg-ice/30 transition-colors"
      >
        <span className="text-sm font-semibold text-graphite pr-4">{q}</span>
        {open ? (
          <ChevronUp size={16} className="text-frost flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-slate flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate leading-relaxed border-t border-graphite/5 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main>
      <Navbar />

      {/* Header */}
      <section className="bg-graphite text-ice">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <HelpCircle size={32} className="text-frost mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="font-display text-4xl font-semibold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-light text-lg max-w-xl mx-auto">
            Everything you need to know about our services, billing, maintenance plans, and customer portal.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {faqs.map((category) => (
          <div key={category.category}>
            <h2 className="font-display text-xl font-semibold mb-5 text-graphite flex items-center gap-2">
              <span className="w-1.5 h-5 bg-frost rounded-full inline-block" />
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Still have questions CTA */}
      <section className="bg-ice-dim">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold mb-3">Still have questions?</h2>
          <p className="text-slate mb-6">
            Our support team is available Monday–Saturday, 8am–8pm, and for emergency dispatch 24/7.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/contact"
              className="bg-graphite hover:bg-graphite-light text-ice text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Contact Support
            </a>
            <a
              href="tel:+18005550142"
              className="border border-graphite/20 hover:border-graphite/40 text-graphite text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Call (800) 555-0142
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
