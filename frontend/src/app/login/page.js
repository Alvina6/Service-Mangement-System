"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Snowflake } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-graphite flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center font-display text-lg font-semibold text-ice mb-8">
          <Snowflake size={20} className="text-frost-light" />
          ArcticAir
        </Link>

        <div className="bg-graphite-light rounded-2xl p-8 border border-white/10">
          <h1 className="font-display text-xl font-semibold text-ice mb-1">Welcome back</h1>
          <p className="text-sm text-slate-light mb-6">Log in to your ServiceFlow account.</p>

          {error && (
            <p className="text-sm bg-ember/10 border border-ember/30 text-ember-light rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-light block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-slate-light block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-graphite-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-ice focus:border-frost outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-frost hover:bg-frost-light text-ice font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-xs text-slate-light mt-6 text-center">
            New customer?{" "}
            <Link href="/register" className="text-frost-light">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-light/60 leading-relaxed">
          Demo accounts (seeded): admin@arcticair.com · dispatcher@arcticair.com ·<br />
          technician@arcticair.com · customer@arcticair.com — password: password123
        </div>
      </div>
    </main>
  );
}
