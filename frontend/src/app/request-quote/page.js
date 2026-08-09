"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { AlertTriangle } from "lucide-react";

const requestTypes = [
  { value: "installation", label: "New Installation" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "maintenance", label: "Maintenance Visit" },
  { value: "emergency", label: "Emergency" },
];

export default function RequestQuotePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    requestType: "repair",
    description: "",
    preferredDate: "",
    address: user?.address || "",
    city: user?.city || "",
    isEmergency: false,
    images: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    try {
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, res.data.url],
      }));
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?next=/request-quote");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/service-requests", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navbar />
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-2">Request a service</h1>
        <p className="text-slate mb-8">
          Tell us what&apos;s going on. A dispatcher will assign a technician and follow up with a quotation.
        </p>

        {!authLoading && !user && (
          <p className="text-sm bg-frost/5 border border-frost/20 text-frost-dark rounded-lg px-4 py-3 mb-6">
            You&apos;ll need to{" "}
            <a href="/login?next=/request-quote" className="underline font-medium">
              log in
            </a>{" "}
            or{" "}
            <a href="/register" className="underline font-medium">
              create an account
            </a>{" "}
            to submit a request — it lets you track status from your dashboard afterward.
          </p>
        )}

        {submitted ? (
          <div className="bg-mint/10 border border-mint/30 rounded-xl p-6">
            <h2 className="font-display font-semibold text-mint mb-1">Request received</h2>
            <p className="text-sm text-slate">
              We&apos;ve logged your request. You can track its status any time from your customer dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm bg-ember/10 border border-ember/30 text-ember-dark rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="text-xs text-slate block mb-1.5">Service type</label>
              <select
                value={form.requestType}
                onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white"
              >
                {requestTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate block mb-1.5">Describe the issue</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white"
                placeholder="e.g. AC unit is running but not cooling below 78°F"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate block mb-1.5">Address</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate block mb-1.5">City</label>
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate block mb-1.5">Preferred date</label>
              <input
                type="date"
                value={form.preferredDate}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate block mb-1.5">Upload service photos (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full border border-graphite/15 rounded-lg px-3 py-2.5 text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-frost/10 file:text-frost hover:file:bg-frost/20 cursor-pointer"
              />
              {uploading && <p className="text-xs text-frost mt-1 animate-pulse">Uploading photo...</p>}
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {form.images.map((imgUrl, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-graphite/10 aspect-square">
                      <img src={imgUrl} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-ember/90 text-ice text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-ember-dark">
              <input
                type="checkbox"
                checked={form.isEmergency}
                onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
              />
              <AlertTriangle size={14} /> This is an emergency (no heat/cooling)
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-ember hover:bg-ember-light text-ice font-medium text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit request"}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </main>
  );
}
