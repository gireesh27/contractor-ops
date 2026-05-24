import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { MotionPage } from "@/components/premium/MotionPage";
import { permissionMatrix } from "@/lib/permissions";

const fields = [
  { name: "name", label: "Client name", required: true },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "address", label: "Address", type: "textarea" as const }
];

export default function SettingsPage() {
  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Settings" title="Organization, users, roles, and production setup" />
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
          <h2 className="text-xl font-black">Invite user placeholder</h2>
          <p className="mt-2 text-sm text-slate-500">User invitations should create OrganizationMember records and email invites through your provider.</p>
          <div className="mt-5">
            <CrudForm collection="clients" fields={fields} compact />
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
