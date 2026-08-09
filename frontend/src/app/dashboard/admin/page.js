"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import GaugeDial from "@/components/GaugeDial";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  ClipboardList,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  Plus,
  Trash2,
  Send,
  Printer,
  DollarSign,
  Calendar,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Wrench
} from "lucide-react";

const COLORS = ["#2E6E9E", "#C1652F", "#2F9E6E", "#5B6B7C", "#4A8FC2"];

function KpiCard({ label, value, prefix = "" }) {
  return (
    <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-slate mb-2 font-semibold">{label}</p>
      <p className="font-mono text-2xl font-bold text-graphite">{prefix}{value}</p>
    </div>
  );
}

// Printable Invoice Modal Component
function PrintInvoiceModal({ invoice, onClose }) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const balance = invoice.amount - invoice.amountPaid;

  return (
    <div className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-graphite/10 shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate hover:text-graphite font-semibold text-sm no-print">
          Close Window
        </button>
        
        {/* Printable Area */}
        <div className="printable-content space-y-6">
          <div className="flex justify-between items-start border-b border-graphite/10 pb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-frost">ArcticAir HVAC Solutions</h2>
              <p className="text-xs text-slate mt-1">123 Energy Way, Austin, TX 78701</p>
              <p className="text-xs text-slate">support@arcticair.com | (512) 555-0199</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-slate block">INVOICE</span>
              <span className="font-mono text-lg font-semibold block mt-1">{invoice.invoiceNumber}</span>
              <span className="text-xs text-slate block mt-1">Issued: {new Date(invoice.issuedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate block mb-1">Billed To:</span>
              <p className="font-semibold text-graphite">{invoice.customer?.name}</p>
              <p className="text-slate text-xs mt-0.5">{invoice.customer?.email}</p>
              {invoice.customer?.city && <p className="text-slate text-xs">{invoice.customer?.city}</p>}
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate block mb-1">Due Date:</span>
              <p className="font-semibold text-graphite font-mono">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              <div className="mt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate block">Status:</span>
                <span className="inline-block mt-1 font-bold text-xs uppercase tracking-wider text-frost">{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Simple Item Table */}
          <div className="border border-graphite/10 rounded-xl overflow-hidden mt-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-ice text-slate font-semibold border-b border-graphite/10">
                  <th className="p-3">Service Details / Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-graphite/5">
                  <td className="p-3 font-medium">HVAC Inspection & Repair Work (Invoice for Service Contract/Job)</td>
                  <td className="p-3 text-right font-mono font-semibold">${invoice.amount?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-sm font-mono pt-4 border-t border-graphite/5">
            <div>Total Invoice Amount: <span className="font-bold text-graphite">${invoice.amount?.toFixed(2)}</span></div>
            <div>Amount Paid: <span className="font-semibold text-mint-light">${invoice.amountPaid?.toFixed(2)}</span></div>
            <div className="text-base font-bold border-t border-graphite/10 pt-1.5 mt-1">Outstanding Balance: <span className="text-ember-dark">${balance.toFixed(2)}</span></div>
          </div>

          <div className="border-t border-graphite/10 pt-6 text-center text-xs text-slate-light">
            Thank you for choosing ArcticAir HVAC Solutions. If you have any questions about this invoice, contact billing@arcticair.com.
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 no-print">
          <button onClick={onClose} className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium hover:bg-ice">
            Close
          </button>
          <button onClick={handlePrint} className="text-sm bg-frost hover:bg-frost-light text-ice px-6 py-2 rounded-full font-semibold flex items-center gap-1.5 shadow-sm">
            <Printer size={15} /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Recording Modal Component
function RecordPaymentModal({ invoice, onSave, onClose }) {
  const [paymentForm, setPaymentForm] = useState({
    amount: invoice.amount - invoice.amountPaid,
    method: "credit_card",
    reference: `PAY-${Date.now().toString().slice(-6)}`,
  });

  const submitPayment = (e) => {
    e.preventDefault();
    onSave(invoice._id, paymentForm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-graphite/10 shadow-2xl">
        <h3 className="font-display font-semibold text-lg mb-2">Record Payment</h3>
        <p className="text-xs text-slate mb-4">Record a manual transaction for Invoice <span className="font-mono font-bold">{invoice.invoiceNumber}</span></p>

        <form onSubmit={submitPayment} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate block mb-1">Amount to Record ($)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              max={invoice.amount - invoice.amountPaid}
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate block mb-1">Payment Method</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="credit_card">Credit Card</option>
              <option value="ach">ACH Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check / Bank Draft</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate block mb-1">Reference Number / Memo</label>
            <input
              type="text"
              required
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
              className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white font-mono"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="text-xs border border-graphite/10 px-4 py-2 rounded-full font-medium hover:bg-ice">
              Cancel
            </button>
            <button type="submit" className="text-xs bg-frost text-ice px-4 py-2 rounded-full font-semibold shadow-sm">
              Record Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "quotations" | "invoices" | "maintenance" | "customers" | "technicians"
  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);

  // Modals & States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [activeInvoiceForPay, setActiveInvoiceForPay] = useState(null);

  // Forms Toggle
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);

  // 1. Quotation Form State
  const [quoteForm, setQuoteForm] = useState({
    serviceRequest: "",
    customer: "",
    lineItems: [{ description: "", type: "labor", quantity: 1, unitPrice: 120 }],
    taxPercent: 8.25,
    discountPercent: 0,
    validUntil: "",
    notes: "",
  });

  // 2. Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    customer: "",
    quotation: "",
    amount: 0,
    dueDate: "",
  });

  // 3. Maintenance Contract Form State
  const [contractForm, setContractForm] = useState({
    customer: "",
    planName: "Standard",
    visitsPerYear: 2,
    price: 249,
    startDate: "",
    endDate: "",
    autoRenew: false,
  });

  const loadData = async () => {
    try {
      const [resSummary, resCustomers, resTechs, resRequests, resQuotes, resInvoices, resContracts] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/users?role=customer"),
        api.get("/users?role=technician"),
        api.get("/service-requests"),
        api.get("/quotations"),
        api.get("/invoices"),
        api.get("/maintenance-contracts"),
      ]);
      setSummary(resSummary.data.data);
      setCustomers(resCustomers.data.data);
      setTechnicians(resTechs.data.data);
      setRequests(resRequests.data.data);
      setQuotations(resQuotes.data.data);
      setInvoices(resInvoices.data.data);
      setContracts(resContracts.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quotation Line Item Helpers
  const addLineItem = () => {
    setQuoteForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", type: "other", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLineItem = (index) => {
    setQuoteForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, idx) => idx !== index),
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    setQuoteForm((prev) => {
      const newItems = [...prev.lineItems];
      newItems[index][field] = field === "quantity" || field === "unitPrice" ? Number(value) : value;
      return { ...prev, lineItems: newItems };
    });
  };

  const openQuoteBuilder = (request) => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setQuoteForm({
      serviceRequest: request._id,
      customer: request.customer?._id || "",
      lineItems: [{ description: `${request.requestType.replace(/_/g, " ")} service repair`, type: "labor", quantity: 1, unitPrice: 120 }],
      taxPercent: 8.25,
      discountPercent: 0,
      validUntil: defaultDate.toISOString().split("T")[0],
      notes: "ArcticAir HVAC service repair quote.",
    });
    setActiveTab("quotations");
    setShowQuoteForm(true);
  };

  const calculateQuoteTotals = () => {
    const subtotal = quoteForm.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
    const afterDiscount = subtotal - subtotal * (quoteForm.discountPercent / 100);
    const total = afterDiscount + afterDiscount * (quoteForm.taxPercent / 100);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  };

  const submitQuotation = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/quotations", quoteForm);
      setSuccessMsg("Quotation created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowQuoteForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const sendQuote = async (quoteId) => {
    try {
      setError("");
      await api.put(`/quotations/${quoteId}/send`);
      setSuccessMsg("Quotation sent to customer successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Invoice Handlers
  const handleQuotationLinkForInvoice = (quoteId) => {
    const quote = quotations.find((q) => q._id === quoteId);
    if (quote) {
      setInvoiceForm((prev) => ({
        ...prev,
        quotation: quoteId,
        customer: quote.customer?._id || "",
        amount: quote.total,
      }));
    }
  };

  const openInvoiceGeneratorForQuote = (quote) => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 15);
    setInvoiceForm({
      quotation: quote._id,
      customer: quote.customer?._id || "",
      amount: quote.total,
      dueDate: defaultDue.toISOString().split("T")[0],
    });
    setActiveTab("invoices");
    setShowInvoiceForm(true);
  };

  const submitInvoice = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/invoices", invoiceForm);
      setSuccessMsg("Invoice successfully generated!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowInvoiceForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const recordManualPayment = async (invoiceId, payload) => {
    try {
      setError("");
      await api.post(`/invoices/${invoiceId}/payments`, payload);
      setSuccessMsg("Manual payment transaction recorded!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setActiveInvoiceForPay(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Maintenance Contract Handlers
  const handlePlanTypeChange = (plan) => {
    let visits = 2;
    let price = 249;
    if (plan === "Basic") {
      visits = 1;
      price = 149;
    } else if (plan === "Premium") {
      visits = 4;
      price = 399;
    }
    setContractForm((prev) => ({
      ...prev,
      planName: plan,
      visitsPerYear: visits,
      price: price,
    }));
  };

  const submitContract = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await api.post("/maintenance-contracts", contractForm);
      setSuccessMsg("Maintenance contract successfully configured for customer!");
      setTimeout(() => setSuccessMsg(""), 3000);
      setShowContractForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const runRenewalScan = async () => {
    try {
      setError("");
      const res = await api.post("/maintenance-contracts/check-reminders");
      const { expiredCount, expiringSoonCount, remindersSent } = res.data.data;
      setSuccessMsg(
        `Renewal Scan Complete! Updated: ${expiredCount} expired, ${expiringSoonCount} expiring soon. Sent ${remindersSent} notifications.`
      );
      setTimeout(() => setSuccessMsg(""), 5000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const quoteTotals = calculateQuoteTotals();
  const acceptedQuotes = quotations.filter((q) => q.status === "accepted");

  return (
    <DashboardShell role="admin">
      {/* Title & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-graphite">ArcticAir Administration</h1>
          <p className="text-slate text-sm mt-0.5">Automating HVAC services, operations, billing and maintenance plans.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border border-graphite/10 rounded-full p-1 bg-white max-w-md no-print">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "overview" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("quotations")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "quotations" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Quotations
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "invoices" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Invoices
          </button>
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "maintenance" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Maintenance Plans
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "customers" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("technicians")}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "technicians" ? "bg-graphite text-white shadow-sm" : "text-slate hover:bg-ice"
            }`}
          >
            Technicians
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-ember-dark mb-4 bg-ember/10 border border-ember/30 rounded-lg px-3 py-2 no-print">{error}</p>}
      {successMsg && <p className="text-sm text-mint mb-4 bg-mint/10 border border-mint/30 rounded-lg px-3 py-2 no-print">{successMsg}</p>}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {!summary ? (
            <p className="text-sm text-slate animate-pulse">Loading business insights…</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KpiCard label="Revenue today" value={summary.dailyRevenue.toFixed(2)} prefix="$" />
                <KpiCard label="Revenue this month" value={summary.monthlyRevenue.toFixed(2)} prefix="$" />
                <KpiCard label="Total customers" value={summary.totalCustomers} />
                <KpiCard label="Active contracts" value={summary.activeMaintenanceContracts} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Completed Gauge */}
                <div className="bg-graphite rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm">
                  <GaugeDial
                    value={summary.completedJobs}
                    max={summary.completedJobs + summary.pendingJobs || 1}
                    label="Completed"
                    sublabel={`${summary.pendingJobs} pending`}
                    accent="#2F9E6E"
                  />
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-graphite/10 rounded-2xl p-6 lg:col-span-2 shadow-sm">
                  <h2 className="font-display font-semibold mb-4 text-sm text-graphite">Most requested services</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={summary.mostRequestedServices}>
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2E6E9E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm">
                <h2 className="font-display font-semibold mb-4 text-sm text-graphite">Technician performance (completed jobs)</h2>
                {summary.technicianPerformance.length === 0 ? (
                  <p className="text-sm text-slate italic">No completed jobs yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={summary.technicianPerformance}
                        dataKey="completedJobs"
                        nameKey="technician.name"
                        outerRadius={90}
                        label={(entry) => entry.technician.name}
                      >
                        {summary.technicianPerformance.map((entry, i) => (
                          <Cell key={entry._id} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* QUOTATIONS TAB */}
      {activeTab === "quotations" && (
        <>
          {showQuoteForm ? (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm mb-10 max-w-3xl">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-graphite/5">
                <h2 className="font-display font-semibold text-lg text-graphite">Create Quotation</h2>
                <button onClick={() => setShowQuoteForm(false)} className="text-xs font-semibold text-slate hover:text-graphite">
                  Back to List
                </button>
              </div>

              <form onSubmit={submitQuotation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Select Service Request</label>
                    <select
                      required
                      value={quoteForm.serviceRequest}
                      onChange={(e) => {
                        const reqId = e.target.value;
                        const match = requests.find((r) => r._id === reqId);
                        setQuoteForm({
                          ...quoteForm,
                          serviceRequest: reqId,
                          customer: match?.customer?._id || "",
                        });
                      }}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="" disabled>Select request</option>
                      {requests.map((r) => (
                        <option key={r._id} value={r._id}>{r.requestType.replace(/_/g, " ")} — {r.customer?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Customer</label>
                    <select
                      required
                      value={quoteForm.customer}
                      onChange={(e) => setQuoteForm({ ...quoteForm, customer: e.target.value })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="" disabled>Select client</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-graphite/10 rounded-xl p-4 bg-ice/20">
                  <div className="flex items-center justify-between mb-3 border-b border-graphite/5 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate">Line Items</span>
                    <button type="button" onClick={addLineItem} className="text-xs font-semibold text-frost hover:underline flex items-center gap-0.5">
                      <Plus size={11} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {quoteForm.lineItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Description"
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={item.type}
                            onChange={(e) => handleLineItemChange(idx, "type", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2 py-1.5 text-xs bg-white"
                          >
                            <option value="labor">Labor</option>
                            <option value="equipment">Equipment</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2 py-1.5 text-xs text-center"
                          />
                        </div>
                        <div className="sm:col-span-1.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(idx, "unitPrice", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2 py-1.5 text-xs text-center font-mono"
                          />
                        </div>
                        <div className="sm:col-span-1 text-center">
                          {quoteForm.lineItems.length > 1 && (
                            <button type="button" onClick={() => removeLineItem(idx)} className="text-ember hover:text-ember-dark">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Discount %</label>
                    <input
                      type="number"
                      value={quoteForm.discountPercent}
                      onChange={(e) => setQuoteForm({ ...quoteForm, discountPercent: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Tax %</label>
                    <input
                      type="number"
                      value={quoteForm.taxPercent}
                      onChange={(e) => setQuoteForm({ ...quoteForm, taxPercent: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Valid Until</label>
                    <input
                      type="date"
                      required
                      value={quoteForm.validUntil}
                      onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate block mb-1">Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="border-t border-graphite/5 pt-4 flex flex-col items-end gap-1.5 text-sm font-mono bg-ice/20 p-4 rounded-xl">
                  <div>Subtotal: <span className="font-semibold">${quoteTotals.subtotal.toFixed(2)}</span></div>
                  <div className="text-base font-bold text-frost">Total: <span>${quoteTotals.total.toFixed(2)}</span></div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowQuoteForm(false)} className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium">Cancel</button>
                  <button type="submit" className="text-sm bg-graphite hover:bg-graphite-light text-white px-6 py-2 rounded-full font-semibold shadow-sm">Save Draft</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Quotations Directory</h2>
                <button onClick={() => setShowQuoteForm(true)} className="bg-frost hover:bg-frost-light text-ice text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-sm">
                  <Plus size={13} /> Create Quote
                </button>
              </div>

              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-slate font-semibold">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Valid Until</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-ice/20 transition-colors">
                      <td className="py-3 font-medium">{q.customer?.name}</td>
                      <td className="py-3 capitalize text-slate">{q.serviceRequest?.requestType?.replace(/_/g, " ")}</td>
                      <td className="py-3 font-mono text-xs">{new Date(q.validUntil).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-right font-semibold">${q.total?.toFixed(2)}</td>
                      <td className="py-3 text-center"><StatusBadge status={q.status} /></td>
                      <td className="py-3 text-center">
                        {q.status === "draft" && (
                          <button onClick={() => sendQuote(q._id)} className="bg-frost hover:bg-frost-light text-ice text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors">
                            <Send size={11} /> Send
                          </button>
                        )}
                        {q.status === "accepted" && (
                          <button onClick={() => openInvoiceGeneratorForQuote(q)} className="bg-mint text-ice text-xs font-semibold px-3 py-1.5 rounded-full transition-colors hover:bg-mint-light">
                            Bill Quote
                          </button>
                        )}
                        {q.status !== "draft" && q.status !== "accepted" && <span className="text-xs text-slate-light italic font-mono capitalize">{q.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* INVOICES TAB */}
      {activeTab === "invoices" && (
        <>
          {showInvoiceForm ? (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm mb-10 max-w-xl">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-graphite/5">
                <h2 className="font-display font-semibold text-lg text-graphite">Generate Invoice</h2>
                <button onClick={() => setShowInvoiceForm(false)} className="text-xs font-semibold text-slate hover:text-graphite">
                  Back to List
                </button>
              </div>

              <form onSubmit={submitInvoice} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate block mb-1">Link Accepted Quotation (Optional)</label>
                  <select
                    value={invoiceForm.quotation}
                    onChange={(e) => handleQuotationLinkForInvoice(e.target.value)}
                    className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="">-- No linked quote --</option>
                    {acceptedQuotes.map((q) => (
                      <option key={q._id} value={q._id}>
                        {q.customer?.name} - ${q.total?.toFixed(2)} ({q.serviceRequest?.requestType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate block mb-1">Customer</label>
                  <select
                    required
                    value={invoiceForm.customer}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                    className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="" disabled>Select client</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Invoice Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowInvoiceForm(false)} className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium">Cancel</button>
                  <button type="submit" className="text-sm bg-graphite hover:bg-graphite-light text-white px-6 py-2 rounded-full font-semibold shadow-sm">Generate Invoice</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Invoices & Billing</h2>
                <button onClick={() => {
                  const defaultDue = new Date();
                  defaultDue.setDate(defaultDue.getDate() + 15);
                  setInvoiceForm({ customer: "", quotation: "", amount: 0, dueDate: defaultDue.toISOString().split("T")[0] });
                  setShowInvoiceForm(true);
                }} className="bg-frost hover:bg-frost-light text-ice text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-sm">
                  <Plus size={13} /> New Invoice
                </button>
              </div>

              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-slate font-semibold">
                    <th className="pb-3">Invoice #</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3 font-mono text-right">Amount</th>
                    <th className="pb-3 font-mono text-right">Paid</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 font-mono text-xs">Due Date</th>
                    <th className="pb-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5 font-mono">
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate font-body italic">No invoices found.</td>
                    </tr>
                  )}
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-ice/20 transition-colors">
                      <td className="py-3 font-bold text-graphite">{inv.invoiceNumber}</td>
                      <td className="py-3 font-body font-medium">{inv.customer?.name}</td>
                      <td className="py-3 text-right font-semibold">${inv.amount?.toFixed(2)}</td>
                      <td className="py-3 text-right text-mint">${inv.amountPaid?.toFixed(2)}</td>
                      <td className="py-3 text-center font-body"><StatusBadge status={inv.status} /></td>
                      <td className="py-3 text-xs">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 text-center font-body flex justify-center gap-2">
                        <button
                          onClick={() => setActiveInvoiceForPrint(inv)}
                          className="p-1 hover:text-frost text-slate hover:bg-frost/10 rounded"
                          title="Print Invoice"
                        >
                          <Printer size={15} />
                        </button>
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => setActiveInvoiceForPay(inv)}
                            className="p-1 hover:text-mint text-slate hover:bg-mint/10 rounded"
                            title="Record Payment"
                          >
                            <DollarSign size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MAINTENANCE CONTRACTS TAB */}
      {activeTab === "maintenance" && (
        <>
          {showContractForm ? (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm mb-10 max-w-xl">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-graphite/5">
                <h2 className="font-display font-semibold text-lg text-graphite">Create Maintenance Contract</h2>
                <button onClick={() => setShowContractForm(false)} className="text-xs font-semibold text-slate hover:text-graphite">
                  Back to List
                </button>
              </div>

              <form onSubmit={submitContract} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate block mb-1">Customer</label>
                  <select
                    required
                    value={contractForm.customer}
                    onChange={(e) => setContractForm({ ...contractForm, customer: e.target.value })}
                    className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option value="" disabled>Select client</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Plan Package</label>
                    <select
                      value={contractForm.planName}
                      onChange={(e) => handlePlanTypeChange(e.target.value)}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="Basic">Basic Plan</option>
                      <option value="Standard">Standard Plan</option>
                      <option value="Premium">Premium Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Visits / Year</label>
                    <input
                      type="number"
                      required
                      value={contractForm.visitsPerYear}
                      onChange={(e) => setContractForm({ ...contractForm, visitsPerYear: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Package Price ($)</label>
                    <input
                      type="number"
                      required
                      value={contractForm.price}
                      onChange={(e) => setContractForm({ ...contractForm, price: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm text-center font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={contractForm.startDate}
                      onChange={(e) => {
                        const start = e.target.value;
                        const end = new Date(start);
                        end.setFullYear(end.getFullYear() + 1); // default 1 year duration
                        setContractForm({
                          ...contractForm,
                          startDate: start,
                          endDate: end.toISOString().split("T")[0],
                        });
                      }}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">End Date (Expiration)</label>
                    <input
                      type="date"
                      required
                      value={contractForm.endDate}
                      onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-graphite pt-2">
                  <input
                    type="checkbox"
                    checked={contractForm.autoRenew}
                    onChange={(e) => setContractForm({ ...contractForm, autoRenew: e.target.checked })}
                  />
                  Auto Renew Contract Annually
                </label>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowContractForm(false)} className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium">Cancel</button>
                  <button type="submit" className="text-sm bg-graphite hover:bg-graphite-light text-white px-6 py-2 rounded-full font-semibold shadow-sm">Save Contract</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h2 className="font-display font-semibold text-lg">Maintenance Agreements</h2>
                <div className="flex gap-2">
                  <button onClick={runRenewalScan} className="bg-ember hover:bg-ember-light text-ice text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-sm">
                    <Calendar size={13} /> Scan Renewals & Reminders
                  </button>
                  <button onClick={() => {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const nextYear = new Date();
                    nextYear.setFullYear(nextYear.getFullYear() + 1);
                    setContractForm({ customer: "", planName: "Standard", visitsPerYear: 2, price: 249, startDate: todayStr, endDate: nextYear.toISOString().split("T")[0], autoRenew: false });
                    setShowContractForm(true);
                  }} className="bg-frost hover:bg-frost-light text-ice text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-sm">
                    <Plus size={13} /> Add Contract
                  </button>
                </div>
              </div>

              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-slate font-semibold">
                    <th className="pb-3">Plan Name</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3 font-mono text-right">Price</th>
                    <th className="pb-3 text-center">Visits Used</th>
                    <th className="pb-3 font-mono text-xs">Expires</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {contracts.map((c) => (
                    <tr key={c._id} className="hover:bg-ice/20 transition-colors">
                      <td className="py-3 font-medium flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-mint" /> {c.planName} Plan
                      </td>
                      <td className="py-3">{c.customer?.name}</td>
                      <td className="py-3 font-mono text-right font-semibold">${c.price?.toFixed(2)}</td>
                      <td className="py-3 text-center font-mono">{c.visitsCompleted} / {c.visitsPerYear}</td>
                      <td className="py-3 font-mono text-xs">{new Date(c.endDate).toLocaleDateString()}</td>
                      <td className="py-3 text-center"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === "customers" && (
        <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2"><Users size={18} className="text-frost" /> Customer Directory</h2>
            <span className="text-xs text-slate bg-ice/50 border border-graphite/10 px-3 py-1 rounded-full">{customers.length} total customers</span>
          </div>
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-graphite/10 text-slate font-semibold">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">City</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite/5">
              {customers.length === 0 && (
                <tr><td colSpan="6" className="py-6 text-center text-slate italic">No customers yet.</td></tr>
              )}
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-ice/20 transition-colors">
                  <td className="py-3 font-medium flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-frost/15 flex items-center justify-center text-frost text-xs font-bold flex-shrink-0">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    {c.name}
                  </td>
                  <td className="py-3 text-slate text-xs"><span className="flex items-center gap-1"><Mail size={11} />{c.email}</span></td>
                  <td className="py-3 text-slate text-xs"><span className="flex items-center gap-1"><Phone size={11} />{c.phone || "—"}</span></td>
                  <td className="py-3 text-slate text-xs"><span className="flex items-center gap-1"><MapPin size={11} />{c.city || "—"}</span></td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      c.isActive ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember-dark"
                    }`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/users/${c._id}`, { isActive: !c.isActive });
                          loadData();
                        } catch (err) { setError(err.message); }
                      }}
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full transition-colors ${
                        c.isActive
                          ? "bg-ember/10 text-ember-dark hover:bg-ember/20"
                          : "bg-mint/10 text-mint hover:bg-mint/20"
                      }`}
                    >
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TECHNICIANS TAB */}
      {activeTab === "technicians" && (
        <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg flex items-center gap-2"><Wrench size={18} className="text-frost" /> Technician Management</h2>
            <span className="text-xs text-slate bg-ice/50 border border-graphite/10 px-3 py-1 rounded-full">{technicians.length} technicians</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {technicians.length === 0 && (
              <p className="text-sm text-slate italic col-span-3">No technicians found.</p>
            )}
            {technicians.map((t) => (
              <div key={t._id} className="border border-graphite/10 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-frost/15 flex items-center justify-center text-frost text-sm font-bold flex-shrink-0">
                      {t.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-[10px] text-slate">{t.email}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    t.isActive ? "bg-mint/15 text-mint" : "bg-ember/15 text-ember-dark"
                  }`}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate mb-4">
                  {t.phone && <p className="flex items-center gap-1.5"><Phone size={11} className="text-frost" />{t.phone}</p>}
                  {t.city && <p className="flex items-center gap-1.5"><MapPin size={11} className="text-frost" />{t.city}</p>}
                  <p className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${t.isAvailable ? "bg-mint" : "bg-ember"}`} />
                    {t.isAvailable ? "Available for jobs" : "Currently unavailable"}
                  </p>
                </div>

                {t.skills && t.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {t.skills.map((skill) => (
                      <span key={skill} className="text-[9px] bg-frost/10 text-frost px-2 py-0.5 rounded-full font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-graphite/5">
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/users/${t._id}`, { isActive: !t.isActive });
                        loadData();
                      } catch (err) { setError(err.message); }
                    }}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-full transition-colors ${
                      t.isActive
                        ? "bg-ember/10 text-ember-dark hover:bg-ember/20"
                        : "bg-mint/10 text-mint hover:bg-mint/20"
                    }`}
                  >
                    {t.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.put(`/users/${t._id}`, { isAvailable: !t.isAvailable });
                        loadData();
                      } catch (err) { setError(err.message); }
                    }}
                    className="flex-1 text-xs font-semibold py-1.5 rounded-full bg-graphite/10 hover:bg-graphite/20 text-graphite transition-colors"
                  >
                    {t.isAvailable ? "Set Unavailable" : "Set Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {activeInvoiceForPrint && (
        <PrintInvoiceModal
          invoice={activeInvoiceForPrint}
          onClose={() => setActiveInvoiceForPrint(null)}
        />
      )}

      {activeInvoiceForPay && (
        <RecordPaymentModal
          invoice={activeInvoiceForPay}
          onSave={recordManualPayment}
          onClose={() => setActiveInvoiceForPay(null)}
        />
      )}
    </DashboardShell>
  );
}
