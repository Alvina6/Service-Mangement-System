"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import api from "@/lib/api";
import { AlertTriangle, Plus, Trash2, Send, FileText, ClipboardList, CalendarDays, MapPin } from "lucide-react";

// --- Weekly Calendar Component ---
function WeeklyCalendar({ jobs }) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getJobsForDay = (day) => {
    return jobs.filter((j) => {
      if (!j.scheduledDate) return false;
      const jd = new Date(j.scheduledDate);
      return (
        jd.getFullYear() === day.getFullYear() &&
        jd.getMonth() === day.getMonth() &&
        jd.getDate() === day.getDate()
      );
    });
  };

  const statusColors = {
    scheduled: "bg-frost/15 border-frost/30 text-frost-dark",
    en_route: "bg-amber-50 border-amber-200 text-amber-700",
    in_progress: "bg-mint/10 border-mint/30 text-mint",
    completed: "bg-graphite/10 border-graphite/20 text-slate",
    cancelled: "bg-ember/10 border-ember/20 text-ember-dark",
  };

  return (
    <div className="bg-white border border-graphite/10 rounded-2xl shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-graphite/5">
        <h2 className="font-display font-semibold text-lg">Weekly Job Calendar</h2>
        <span className="text-xs text-slate font-mono">
          {days[0].toLocaleDateString()} — {days[6].toLocaleDateString()}
        </span>
      </div>
      <div className="grid grid-cols-7 min-w-[700px]">
        {days.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayJobs = getJobsForDay(day);
          return (
            <div key={i} className={`border-r border-graphite/5 last:border-0 min-h-[240px] ${
              isToday ? "bg-frost/5" : ""
            }`}>
              <div className={`px-3 py-2 border-b border-graphite/5 text-center ${
                isToday ? "bg-frost text-ice" : "bg-ice/40 text-slate"
              }`}>
                <p className="text-[10px] uppercase font-semibold tracking-wider">{dayNames[i]}</p>
                <p className={`text-lg font-mono font-bold ${isToday ? "text-ice" : "text-graphite"}`}>
                  {day.getDate()}
                </p>
              </div>
              <div className="p-2 space-y-1.5">
                {dayJobs.length === 0 && (
                  <p className="text-[10px] text-slate-light italic text-center pt-4">No jobs</p>
                )}
                {dayJobs.map((job) => (
                  <div
                    key={job._id}
                    className={`border rounded-lg px-2 py-1.5 text-[10px] leading-tight ${statusColors[job.status] || "bg-ice border-graphite/10"}`}
                  >
                    <p className="font-semibold capitalize truncate">
                      {job.serviceRequest?.requestType?.replace(/_/g, " ") || "HVAC Job"}
                    </p>
                    <p className="text-[9px] truncate mt-0.5 opacity-80">{job.customer?.name}</p>
                    <p className="text-[9px] font-mono mt-0.5 opacity-70">
                      {new Date(job.scheduledDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[9px] capitalize mt-0.5 font-semibold">{job.status?.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 py-3 border-t border-graphite/5 flex flex-wrap gap-3 text-[10px]">
        {Object.entries(statusColors).map(([status, cls]) => (
          <span key={status} className={`border rounded px-2 py-0.5 font-semibold capitalize ${cls}`}>
            {status.replace(/_/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DispatcherDashboard() {
  const [activeTab, setActiveTab] = useState("dispatch"); // "dispatch" | "quotations" | "calendar"
  const [requests, setRequests] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [assignment, setAssignment] = useState({});
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quotation Builder Form State
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    serviceRequest: "",
    customer: "",
    lineItems: [{ description: "", type: "other", quantity: 1, unitPrice: 0 }],
    taxPercent: 8.25,
    discountPercent: 0,
    validUntil: "",
    notes: "",
  });

  const loadData = async () => {
    try {
      const [r, t, q, j] = await Promise.all([
        api.get("/service-requests"),
        api.get("/users/technicians/available"),
        api.get("/quotations"),
        api.get("/jobs"),
      ]);
      setRequests(r.data.data);
      setTechnicians(t.data.data);
      setQuotations(q.data.data);
      setJobs(j.data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assign = async (requestId) => {
    const technicianId = assignment[requestId]?.technicianId;
    const scheduledDate = assignment[requestId]?.scheduledDate;
    if (!technicianId || !scheduledDate) return;
    try {
      setError("");
      await api.put(`/service-requests/${requestId}/assign`, { technicianId, scheduledDate });
      await api.post("/jobs", {
        serviceRequest: requestId,
        customer: requests.find((r) => r._id === requestId)?.customer?._id,
        technician: technicianId,
        scheduledDate,
      });
      setSuccessMsg("Technician successfully assigned and job scheduled!");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Quotation Helpers
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
    defaultDate.setDate(defaultDate.getDate() + 30); // Valid for 30 days
    setQuoteForm({
      serviceRequest: request._id,
      customer: request.customer?._id || "",
      lineItems: [{ description: `${request.requestType.replace(/_/g, " ")} service repair`, type: "labor", quantity: 1, unitPrice: 120 }],
      taxPercent: 8.25,
      discountPercent: 0,
      validUntil: defaultDate.toISOString().split("T")[0],
      notes: "ArcticAir HVAC standard repair quotation.",
    });
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
      setSuccessMsg("Quotation successfully created as draft!");
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

  const pending = requests.filter((r) => r.status === "pending");
  const active = requests.filter((r) => ["assigned", "in_progress"].includes(r.status));
  const totals = calculateQuoteTotals();

  return (
    <DashboardShell role="dispatcher">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-semibold">Dispatch dashboard</h1>
        
        {/* Tab Selection */}
        <div className="flex border border-graphite/10 rounded-full p-1 bg-white">
          <button
            onClick={() => { setActiveTab("dispatch"); setShowQuoteForm(false); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "dispatch" ? "bg-graphite text-white" : "text-slate hover:bg-ice"
            }`}
          >
            <ClipboardList size={14} /> Service Dispatch
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "calendar" ? "bg-graphite text-white" : "text-slate hover:bg-ice"
            }`}
          >
            <CalendarDays size={14} /> Calendar
          </button>
          <button
            onClick={() => setActiveTab("quotations")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "quotations" ? "bg-graphite text-white" : "text-slate hover:bg-ice"
            }`}
          >
            <FileText size={14} /> Quotations ({quotations.length})
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-ember-dark mb-4 bg-ember/10 border border-ember/30 rounded-lg px-3 py-2">{error}</p>}
      {successMsg && <p className="text-sm text-mint mb-4 bg-mint/10 border border-mint/30 rounded-lg px-3 py-2">{successMsg}</p>}

      {/* CALENDAR TAB */}
      {activeTab === "calendar" && (
        <>
          <WeeklyCalendar jobs={jobs} />
        </>
      )}

      {/* DISPATCH BOARD TAB */}
      {activeTab === "dispatch" && (
        <>
          <section className="mb-10">
            <h2 className="font-display font-semibold mb-4 text-lg">Unassigned requests ({pending.length})</h2>
            <div className="space-y-4">
              {pending.length === 0 && <p className="text-sm text-slate">Nothing waiting on assignment.</p>}
              {pending.map((r) => (
                <div key={r._id} className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium capitalize flex items-center gap-2 text-base">
                        {r.isEmergency && <AlertTriangle size={15} className="text-ember" />}
                        {r.requestType.replace(/_/g, " ")} — {r.customer?.name}
                      </p>
                      <p className="text-sm text-slate mt-1">{r.description}</p>
                      <p className="text-xs text-slate-light mt-1 font-mono">{r.address}, {r.city}</p>
                      {r.images && r.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {r.images.map((imgUrl, i) => (
                            <a key={i} href={imgUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded border overflow-hidden hover:opacity-85 transition-opacity">
                              <img src={imgUrl} alt="Issue" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={r.status} />
                      <button
                        onClick={() => openQuoteBuilder(r)}
                        className="text-xs font-semibold text-frost hover:underline flex items-center gap-1 mt-1 border border-frost/10 rounded-full px-3 py-1 bg-frost/5"
                      >
                        <Plus size={12} /> Create Quote
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-end border-t border-graphite/5 pt-4 mt-4">
                    <div>
                      <label className="text-xs text-slate block mb-1 font-semibold">Assign Technician</label>
                      <select
                        onChange={(e) => setAssignment({ ...assignment, [r._id]: { ...assignment[r._id], technicianId: e.target.value } })}
                        className="border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white min-w-[200px]"
                        defaultValue=""
                      >
                        <option value="" disabled>Select technician</option>
                        {technicians.map((t) => (
                          <option key={t._id} value={t._id}>{t.name} ({t.skills?.join(", ") || "HVAC Tech"})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate block mb-1 font-semibold">Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        onChange={(e) => setAssignment({ ...assignment, [r._id]: { ...assignment[r._id], scheduledDate: e.target.value } })}
                        className="border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                      />
                    </div>
                    <button
                      onClick={() => assign(r._id)}
                      className="bg-frost hover:bg-frost-light text-ice text-sm font-semibold px-5 py-2 rounded-full transition-colors ml-auto shadow-sm"
                    >
                      Assign Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold mb-4 text-lg">In progress jobs ({active.length})</h2>
            <ul className="space-y-3">
              {active.length === 0 && <p className="text-sm text-slate italic">No jobs currently in progress.</p>}
              {active.map((r) => (
                <li key={r._id} className="bg-white border border-graphite/10 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
                  <span className="text-sm font-medium">
                    <span className="capitalize text-slate">{r.requestType.replace(/_/g, " ")}</span>
                    <span className="text-slate-light"> for </span>
                    {r.customer?.name}
                    <span className="text-xs text-slate-light font-mono block sm:inline sm:ml-3">
                      {r.assignedTechnician ? `Tech: ${r.assignedTechnician.name}` : ""}
                    </span>
                  </span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* QUOTATIONS TAB */}
      {activeTab === "quotations" && (
        <>
          {showQuoteForm ? (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm mb-10 max-w-3xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-graphite/5">
                <h2 className="font-display font-semibold text-lg">New Service Quotation</h2>
                <button onClick={() => setShowQuoteForm(false)} className="text-xs font-semibold text-slate hover:text-graphite">
                  Back to List
                </button>
              </div>

              <form onSubmit={submitQuotation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Customer ID</label>
                    <input
                      type="text"
                      value={quoteForm.customer}
                      readOnly
                      className="w-full border border-graphite/10 rounded-lg px-3 py-2 text-sm bg-ice/40 font-mono text-slate-light"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Request ID</label>
                    <input
                      type="text"
                      value={quoteForm.serviceRequest}
                      readOnly
                      className="w-full border border-graphite/10 rounded-lg px-3 py-2 text-sm bg-ice/40 font-mono text-slate-light"
                    />
                  </div>
                </div>

                {/* Line Items Builder */}
                <div className="border border-graphite/10 rounded-xl p-4 bg-ice/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate">Quotation Line Items</span>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-xs font-semibold text-frost hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Line Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {quoteForm.lineItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center border-b border-graphite/5 pb-3 last:border-0 last:pb-0">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            placeholder="Item description (e.g. Condenser Coil Replacement)"
                            required
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-3 py-1.5 text-xs bg-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <select
                            value={item.type}
                            onChange={(e) => handleLineItemChange(idx, "type", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-3 py-1.5 text-xs bg-white"
                          >
                            <option value="labor">Labor Cost</option>
                            <option value="equipment">Equipment</option>
                            <option value="other">Other Cost</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1.5 col-span-6">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2 py-1.5 text-xs bg-white text-center"
                          />
                        </div>
                        <div className="sm:col-span-1.5 col-span-6">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(idx, "unitPrice", e.target.value)}
                            className="w-full border border-graphite/15 rounded-lg px-2 py-1.5 text-xs bg-white text-center font-mono"
                          />
                        </div>
                        <div className="sm:col-span-1 text-center">
                          {quoteForm.lineItems.length > 1 && (
                            <button type="button" onClick={() => removeLineItem(idx)} className="text-ember hover:text-ember-dark">
                              <Trash2 size={15} />
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
                      min="0"
                      max="100"
                      value={quoteForm.discountPercent}
                      onChange={(e) => setQuoteForm({ ...quoteForm, discountPercent: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate block mb-1">Tax %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={quoteForm.taxPercent}
                      onChange={(e) => setQuoteForm({ ...quoteForm, taxPercent: Number(e.target.value) })}
                      className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
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
                  <label className="text-xs font-bold text-slate block mb-1">Quotation Notes / Terms</label>
                  <textarea
                    rows={2}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    className="w-full border border-graphite/15 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Subtotals Box */}
                <div className="border-t border-graphite/5 pt-4 flex flex-col items-end gap-1.5 text-sm font-mono bg-ice/20 p-4 rounded-xl">
                  <div>Subtotal: <span className="font-semibold">${totals.subtotal.toFixed(2)}</span></div>
                  {quoteForm.discountPercent > 0 && <div className="text-ember">Discount ({quoteForm.discountPercent}%): <span className="font-semibold">-${(totals.subtotal * quoteForm.discountPercent / 100).toFixed(2)}</span></div>}
                  {quoteForm.taxPercent > 0 && <div>Tax ({quoteForm.taxPercent}%): <span className="font-semibold">+${((totals.subtotal * (1 - quoteForm.discountPercent/100)) * quoteForm.taxPercent / 100).toFixed(2)}</span></div>}
                  <div className="text-base border-t border-graphite/10 pt-1.5 mt-1 font-bold">Total: <span className="text-frost">${totals.total.toFixed(2)}</span></div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="text-sm border border-graphite/10 px-5 py-2 rounded-full font-medium transition-colors hover:bg-ice"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm bg-graphite hover:bg-graphite-light text-white px-6 py-2 rounded-full font-semibold transition-all shadow-sm"
                  >
                    Save Quotation Draft
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-graphite/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
              <h2 className="font-display font-semibold mb-4 text-lg">Active Quotations ({quotations.length})</h2>
              
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-graphite/10 text-slate font-semibold">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Service Details</th>
                    <th className="pb-3">Valid Until</th>
                    <th className="pb-3 font-mono text-right">Total</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate italic">No quotations found.</td>
                    </tr>
                  )}
                  {quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-ice/20 transition-colors">
                      <td className="py-3 font-medium">{q.customer?.name || "Casey Customer"}</td>
                      <td className="py-3 capitalize text-slate">{q.serviceRequest?.requestType?.replace(/_/g, " ") || "HVAC Repair"}</td>
                      <td className="py-3 font-mono text-xs">{new Date(q.validUntil).toLocaleDateString()}</td>
                      <td className="py-3 font-mono text-right font-semibold">${q.total?.toFixed(2)}</td>
                      <td className="py-3 text-center"><StatusBadge status={q.status} /></td>
                      <td className="py-3 text-center">
                        {q.status === "draft" && (
                          <button
                            onClick={() => sendQuote(q._id)}
                            className="bg-frost hover:bg-frost-light text-ice text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1 transition-colors"
                          >
                            <Send size={11} /> Send
                          </button>
                        )}
                        {q.status !== "draft" && <span className="text-xs text-slate-light italic font-mono capitalize">{q.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
