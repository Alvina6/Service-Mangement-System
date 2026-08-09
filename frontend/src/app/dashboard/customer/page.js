"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { PlusCircle, Printer, CreditCard, RefreshCw, X, ShieldCheck } from "lucide-react";
import Link from "next/link";

function Section({ title, action, children }) {
  return (
    <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-graphite/5">
        <h2 className="font-display font-semibold text-graphite text-base">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// Printable Invoice Modal for Customer
function CustomerInvoiceModal({ invoice, onClose }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-graphite/10 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate hover:text-graphite font-semibold text-sm no-print">
          Close
        </button>
        
        <div className="printable-content space-y-6 text-graphite">
          <div className="flex justify-between items-start border-b border-graphite/10 pb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-frost">ArcticAir HVAC Solutions</h2>
              <p className="text-xs text-slate mt-1">123 Energy Way, Austin, TX 78701</p>
              <p className="text-xs text-slate">support@arcticair.com | (512) 555-0199</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-slate block">INVOICE RECEIPT</span>
              <span className="font-mono text-lg font-semibold block mt-1">{invoice.invoiceNumber}</span>
              <span className="text-xs text-slate block mt-1">Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate block mb-1">Customer Details:</span>
              <p className="font-semibold">{invoice.customer?.name}</p>
              <p className="text-slate text-xs mt-0.5">{invoice.customer?.email}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate block mb-1">Due Date:</span>
              <p className="font-semibold font-mono">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              <div className="mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate block">Status:</span>
                <span className="font-bold text-xs uppercase tracking-wider text-frost block mt-1">{invoice.status}</span>
              </div>
            </div>
          </div>

          <div className="border border-graphite/10 rounded-xl overflow-hidden mt-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-ice text-slate font-semibold border-b border-graphite/10">
                  <th className="p-3">Service Provided</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-graphite/5">
                  <td className="p-3">Residential / Commercial HVAC Inspections, Repairs and System Commissioning</td>
                  <td className="p-3 text-right font-mono font-semibold">${invoice.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-sm font-mono pt-4 border-t border-graphite/5">
            <div>Total: <span className="font-bold">${invoice.amount?.toFixed(2)}</span></div>
            <div>Paid: <span className="font-semibold text-mint">${invoice.amountPaid?.toFixed(2)}</span></div>
            <div className="text-base font-bold border-t border-graphite/10 pt-1.5 mt-1">Outstanding Balance: <span className="text-ember">${(invoice.amount - invoice.amountPaid).toFixed(2)}</span></div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 no-print">
          <button onClick={onClose} className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium hover:bg-ice">
            Close
          </button>
          <button onClick={handlePrint} className="text-sm bg-frost hover:bg-frost-light text-ice px-6 py-2 rounded-full font-semibold flex items-center gap-1.5 shadow-sm">
            <Printer size={15} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock Credit Card Checkout Modal
function CreditCardPaymentModal({ invoice, onPaymentSuccess, onClose }) {
  const [cardForm, setCardForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    amount: invoice.amount - invoice.amountPaid,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleCardFormat = (val) => {
    const clean = val.replace(/\D/g, "");
    const matches = clean.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return clean;
    }
  };

  const handleExpiryFormat = (val) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  const executePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    
    // Simple basic check validation
    const cleanCard = cardForm.number.replace(/\s/g, "");
    if (cleanCard.length < 16) {
      setErr("Card number must be 16 digits");
      setLoading(false);
      return;
    }
    if (cardForm.expiry.length < 5) {
      setErr("Expiration date must be MM/YY");
      setLoading(false);
      return;
    }
    if (cardForm.cvv.length < 3) {
      setErr("CVV code must be at least 3 digits");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/invoices/${invoice._id}/payments`, {
        amount: cardForm.amount,
        method: "credit_card",
        reference: `CC-${Date.now().toString().slice(-6)}`,
      });
      onPaymentSuccess();
    } catch (error) {
      setErr(error.message || "Payment transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-graphite/10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate hover:text-graphite">
          <X size={18} />
        </button>
        <h3 className="font-display font-semibold text-lg mb-2">Debit / Credit Card</h3>
        <p className="text-xs text-slate mb-4">Pay Invoice <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>. Balance due: <span className="font-bold text-graphite">${(invoice.amount - invoice.amountPaid).toFixed(2)}</span></p>

        {err && <p className="text-xs text-ember-dark bg-ember/15 border border-ember/30 p-2 rounded mb-3 font-semibold">{err}</p>}

        <form onSubmit={executePayment} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate block mb-0.5">Card Number</label>
            <input
              type="text"
              required
              maxLength="19"
              placeholder="0000 0000 0000 0000"
              value={cardForm.number}
              onChange={(e) => setCardForm({ ...cardForm, number: handleCardFormat(e.target.value) })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-mono bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate block mb-0.5">Cardholder Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Casey Customer"
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate block mb-0.5">Expiry Date</label>
              <input
                type="text"
                required
                maxLength="5"
                placeholder="MM/YY"
                value={cardForm.expiry}
                onChange={(e) => setCardForm({ ...cardForm, expiry: handleExpiryFormat(e.target.value) })}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-mono bg-white text-center"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate block mb-0.5">CVV Code</label>
              <input
                type="password"
                required
                maxLength="4"
                placeholder="123"
                value={cardForm.cvv}
                onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, "") })}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-mono bg-white text-center"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate block mb-0.5">Payment Amount ($)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              max={invoice.amount - invoice.amountPaid}
              value={cardForm.amount}
              onChange={(e) => setCardForm({ ...cardForm, amount: Number(e.target.value) })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-mono bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-frost hover:bg-frost-light text-ice text-sm font-semibold py-2.5 rounded-full shadow-sm transition-colors mt-3 flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            <CreditCard size={15} />
            {loading ? "Processing..." : `Pay $${cardForm.amount?.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Customer Modals Trigger
  const [invoiceForPrint, setInvoiceForPrint] = useState(null);
  const [invoiceForPay, setInvoiceForPay] = useState(null);

  const loadAll = async () => {
    try {
      const [r, q, i, c] = await Promise.all([
        api.get("/service-requests"),
        api.get("/quotations"),
        api.get("/invoices"),
        api.get("/maintenance-contracts"),
      ]);
      setRequests(r.data.data);
      setQuotations(r.data.data ? q.data.data : []);
      setInvoices(i.data.data);
      setContracts(c.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const respondToQuote = async (id, decision) => {
    try {
      setError("");
      await api.put(`/quotations/${id}/respond`, { decision });
      setSuccess(`Quotation successfully ${decision}!`);
      setTimeout(() => setSuccess(""), 3000);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const renewContract = async (contract) => {
    // Add exactly 1 year to the endDate
    const oldEnd = new Date(contract.endDate);
    const newEnd = new Date(oldEnd);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    
    try {
      setError("");
      await api.put(`/maintenance-contracts/${contract._id}/renew`, {
        newEndDate: newEnd.toISOString().split("T")[0],
      });
      setSuccess(`Maintenance plan "${contract.planName}" renewed successfully for 1 year!`);
      setTimeout(() => setSuccess(""), 4000);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardShell role="customer">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-graphite">My Account Portal</h1>
          <p className="text-sm text-slate mt-0.5">Track and manage your HVAC services, quotes and upkeep contracts.</p>
        </div>
        <Link href="/request-quote" className="flex items-center gap-1.5 bg-ember hover:bg-ember-light text-ice text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
          <PlusCircle size={16} /> New Request
        </Link>
      </div>

      {error && <p className="text-sm text-ember-dark mb-4 bg-ember/10 border border-ember/30 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-mint mb-4 bg-mint/10 border border-mint/30 rounded-lg px-3 py-2">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Service Requests */}
        <Section title="Service Requests">
          {requests.length === 0 && <p className="text-sm text-slate italic py-4">No active service requests.</p>}
          <ul className="space-y-4">
            {requests.map((r) => (
              <li key={r._id} className="flex flex-col border-b border-graphite/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize text-graphite">{r.requestType.replace(/_/g, " ")}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-slate mt-1">{r.description?.slice(0, 100)}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-light font-mono">
                  <span>Preferred Date: {r.preferredDate ? new Date(r.preferredDate).toLocaleDateString() : "Anytime"}</span>
                  {r.scheduledDate && <span className="text-frost font-bold">Scheduled: {new Date(r.scheduledDate).toLocaleDateString()}</span>}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Quotations */}
        <Section title="Quotations">
          {quotations.length === 0 && <p className="text-sm text-slate italic py-4">No quotations available.</p>}
          <ul className="space-y-4">
            {quotations.map((q) => (
              <li key={q._id} className="border-b border-graphite/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold text-graphite">${q.total?.toFixed(2)}</span>
                  <StatusBadge status={q.status} />
                </div>
                <p className="text-[11px] text-slate font-mono">Valid Until: {new Date(q.validUntil).toLocaleDateString()}</p>
                {q.status === "sent" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => respondToQuote(q._id, "accepted")} className="text-xs bg-mint/10 hover:bg-mint/20 text-mint px-4 py-1.5 rounded-full font-semibold transition-all">
                      Accept & Schedule
                    </button>
                    <button onClick={() => respondToQuote(q._id, "rejected")} className="text-xs bg-ember/10 hover:bg-ember/20 text-ember-dark px-4 py-1.5 rounded-full font-semibold transition-all">
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {/* Invoices */}
        <Section title="Invoices">
          {invoices.length === 0 && <p className="text-sm text-slate italic py-4">No billing invoices found.</p>}
          <ul className="space-y-4">
            {invoices.map((inv) => {
              const balance = inv.amount - inv.amountPaid;
              return (
                <li key={inv._id} className="flex flex-col border-b border-graphite/5 pb-3 last:border-0 last:pb-0 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-graphite text-sm font-mono">{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center justify-between text-slate">
                    <span>Total: ${inv.amount?.toFixed(2)}</span>
                    <span>Paid: ${inv.amountPaid?.toFixed(2)}</span>
                    <span className="font-bold text-graphite">Balance: ${balance.toFixed(2)}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-3 no-print">
                    <button
                      onClick={() => setInvoiceForPrint(inv)}
                      className="text-xs font-semibold text-frost hover:underline flex items-center gap-1 border border-frost/10 rounded-full px-3 py-1 bg-frost/5"
                    >
                      <Printer size={12} /> View/Print
                    </button>
                    {balance > 0 && (
                      <button
                        onClick={() => setInvoiceForPay(inv)}
                        className="text-xs font-semibold text-mint hover:underline flex items-center gap-1 border border-mint/10 rounded-full px-3 py-1 bg-mint/5"
                      >
                        <CreditCard size={12} /> Pay Now
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Maintenance Contracts */}
        <Section title="Maintenance Contracts">
          {contracts.length === 0 && <p className="text-sm text-slate italic py-4">No maintenance contracts configured.</p>}
          <ul className="space-y-4">
            {contracts.map((c) => {
              const isExpiring = c.status === "expiring_soon" || c.status === "expired";
              return (
                <li key={c._id} className="border-b border-graphite/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold flex items-center gap-1 text-graphite">
                      <ShieldCheck size={14} className="text-mint" /> {c.planName} Plan
                    </p>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate">
                    <span>Visits: {c.visitsCompleted}/{c.visitsPerYear} completed</span>
                    <span className="font-mono text-xs">Expires: {new Date(c.endDate).toLocaleDateString()}</span>
                  </div>
                  {isExpiring && (
                    <button
                      onClick={() => renewContract(c)}
                      className="text-xs font-semibold text-ember hover:underline flex items-center gap-1 border border-ember/10 rounded-full px-4 py-1.5 bg-ember/5 mt-3 transition-all"
                    >
                      <RefreshCw size={12} className="animate-spin-slow" /> Renew Plan for 1 Year
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      </div>

      {/* CUSTOMER MODALS */}
      {invoiceForPrint && (
        <CustomerInvoiceModal
          invoice={invoiceForPrint}
          onClose={() => setInvoiceForPrint(null)}
        />
      )}

      {invoiceForPay && (
        <CreditCardPaymentModal
          invoice={invoiceForPay}
          onPaymentSuccess={() => {
            setInvoiceForPay(null);
            setSuccess("Payment successful! Thank you for your business.");
            setTimeout(() => setSuccess(""), 4000);
            loadAll();
          }}
          onClose={() => setInvoiceForPay(null)}
        />
      )}
    </DashboardShell>
  );
}
