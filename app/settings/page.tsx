import Link from "next/link";
import { Bell, Database, ShieldCheck, UserCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { permissionMatrix } from "@/lib/permissions";

export default function SettingsPage() {
  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Settings" title="Organization, users, roles, and production setup" />
        <section className="grid gap-4 md:grid-cols-3">
          <Link className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-glow" href="/profile">
            <UserCircle className="h-6 w-6 text-blueprint" />
            <h2 className="mt-4 text-xl font-black">Profile and account</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Update user details, image, password, organization GST, city, and state.</p>
          </Link>
          <Link className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-glow" href="/notifications">
            <Bell className="h-6 w-6 text-amber-500" />
            <h2 className="mt-4 text-xl font-black">Notification preferences</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Review alerts for bills, payments, tasks, low stock, and AI events.</p>
          </Link>
          <div className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
            <Database className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-4 text-xl font-black">Production environment</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Configure MongoDB, Auth, Redis, Razorpay, Cashfree, Cloudinary, and AI keys from environment variables only.</p>
          </div>
        </section>
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blueprint" aria-hidden="true" />
            <h2 className="text-xl font-black">Role-based permissions</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(permissionMatrix).map(([role, permissions]) => (
              <div key={role} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-black">{role}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {permissions.map((permission) => (
                    <span key={permission} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{permission}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </MotionPage>
    </AppShell>
  );
}
