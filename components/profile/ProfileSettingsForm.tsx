"use client";

import { useState } from "react";
import { Bell, Loader2, Save, ShieldCheck } from "lucide-react";
import { DragDropImageUpload } from "@/components/uploads/DragDropImageUpload";

function notify(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

export function ProfileSettingsForm({
  user,
  organization,
  role
}: {
  user: { name: string; email: string; phone: string; image: string };
  organization: { name: string; gstNumber: string; city: string; state: string };
  role: string;
}) {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(user.image);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    if (image) formData.set("image", image);
    try {
      const response = await fetch("/api/profile", { method: "PATCH", body: formData });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Unable to update profile.");
      notify("Profile settings saved.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update profile.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]" onSubmit={onSubmit}>
      <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
        <h2 className="text-xl font-black">User profile</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">{user.email}</p>
        <div className="mt-5 grid gap-4">
          <DragDropImageUpload folder="profiles" label="Upload profile image" onUploaded={(file) => setImage(file.url)} value={image} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Name
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={user.name} name="name" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Phone
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={user.phone} name="phone" />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
        <h2 className="text-xl font-black">Organization and security</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Organization name
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={organization.name} name="organizationName" disabled={!["Super Admin", "Organization Owner", "Owner"].includes(role)} />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            GST number
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={organization.gstNumber} name="gstNumber" disabled={!["Super Admin", "Organization Owner", "Owner"].includes(role)} />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            City
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={organization.city} name="city" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            State
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" defaultValue={organization.state} name="state" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Current password
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name="currentPassword" type="password" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            New password
            <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" minLength={8} name="newPassword" type="password" />
          </label>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <Bell className="h-5 w-5 text-blueprint" />
            <p className="mt-3 text-sm font-black">Notification preference</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">In-app, toast, and browser push prompts are available from Notifications.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-3 text-sm font-black">Current role</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{role}</p>
          </div>
        </div>
        <button className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950" disabled={loading} type="submit">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </button>
      </section>
    </form>
  );
}
