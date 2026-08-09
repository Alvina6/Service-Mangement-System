"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Snowflake } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", address: "", city: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.push("/dashboard/customer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-graphite flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center font-display text-lg font-semibold text-ice mb-8">
          <Snowflake size={20} className="text-frost-light" />
          ArcticAir
        </Link>

        <div className="bg-graphite-light rounded-2xl p-8 border border-white/10">
          <h1 className="font-display text-xl font-semibold text-ice mb-1">Create your account</h1>
          <p className="text-sm text-slate-light mb-6">Request service and track every visit in one place.</p>

          {error && (
            <p className="text-sm bg-ember/10 border border-ember/30 text-ember-light rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input required placeholder="Full name" value={form.name} onChange={update("name")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <input required type="email" placeholder="Email" value={form.email} onChange={update("email")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <input placeholder="Phone" value={form.phone} onChange={update("phone")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <input placeholder="Address" value={form.address} onChange={update("address")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <input placeholder="City" value={form.city} onChange={update("city")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <input required type="password" minLength={6} placeholder="Password (min 6 characters)" value={form.password} onChange={update("password")}
              className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none" />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ember hover:bg-ember-light text-ice font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-slate-light mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-frost-light">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
