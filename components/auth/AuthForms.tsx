"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Chrome, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email/password or MongoDB is not configured.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="grid gap-4">
      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-900 shadow-sm hover:border-blueprint"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        type="button"
      >
        <Chrome className="h-4 w-4" aria-hidden="true" />
        Continue with Google
      </button>

      <div className="relative text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        <span className="bg-white px-3">or</span>
        <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-slate-200" />
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="email"
          placeholder="Email"
          required
          type="email"
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="password"
          placeholder="Password"
          required
          type="password"
        />

        {error ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
          type="submit"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Login
        </button>
      </form>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(
        payload.error ||
          "Unable to create workspace. Check MongoDB configuration."
      );
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Workspace created, but login failed. Try signing in manually.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="organizationName"
          placeholder="Organization name"
          required
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="contractorName"
          placeholder="Contractor name"
          required
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="phone"
          placeholder="Phone"
          type="tel"
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="email"
          placeholder="Email"
          required
          type="email"
        />

        <select
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="businessType"
          defaultValue="Civil contractor"
        >
          <option value="Civil contractor">Civil contractor</option>
          <option value="Interior contractor">Interior contractor</option>
          <option value="Builder">Builder</option>
          <option value="Subcontractor">Subcontractor</option>
          <option value="Site engineer">Site engineer</option>
        </select>

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="city"
          placeholder="City"
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="state"
          placeholder="State"
        />

        <input
          className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
          name="gstNumber"
          placeholder="GST number optional"
        />
      </div>

      <input
        className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
        name="password"
        placeholder="Password, minimum 8 characters"
        required
        type="password"
        minLength={8}
      />

      {error ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : null}
        Create production workspace
      </button>
    </form>
  );
}