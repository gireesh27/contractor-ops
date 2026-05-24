import { CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { listRecords } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export default async function CalendarPage() {
  const tenant = await getTenantContext({ required: true });
  const [tasks, bills, schedule] = tenant
    ? await Promise.all([
        listRecords("tasks", tenant.organizationId),
        listRecords("bills", tenant.organizationId),
        listRecords("schedule", tenant.organizationId)
      ])
    : [[], [], []];
  const events = [
    ...tasks.map((row: any) => ({ title: row.title, date: row.dueDate, type: "Task" })),
    ...bills.map((row: any) => ({ title: row.billNumber, date: row.dueDate, type: "Bill due" })),
    ...schedule.map((row: any) => ({ title: row.taskName, date: row.startDate, type: "Schedule" }))
  ].filter((row) => row.date);

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Calendar" title="Project, billing, labour, and vendor agenda" />
        <div className="grid gap-4 md:grid-cols-4">
          {["Month", "Week", "Day", "Agenda"].map((view) => (
            <div key={view} className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl">
              <CalendarDays className="h-6 w-6 text-blueprint" aria-hidden="true" />
              <p className="mt-4 text-xl font-black">{view}</p>
              <p className="mt-1 text-sm text-slate-500">Calendar view</p>
            </div>
          ))}
        </div>
        <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl">
          <h2 className="text-xl font-black">Agenda</h2>
          <div className="mt-4 grid gap-3">
            {events.length ? events.map((event, index) => (
              <div key={`${event.title}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="font-black">{event.title}</p>
                  <p className="text-sm text-slate-500">{event.type}</p>
                </div>
                <p className="text-sm font-bold text-slate-600">{new Date(event.date).toLocaleDateString("en-IN")}</p>
              </div>
            )) : <p className="text-sm font-semibold text-slate-500">No calendar records yet. Create tasks, bills, or schedule items.</p>}
          </div>
        </div>
      </MotionPage>
    </AppShell>
  );
}
