import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProjectSelector } from "@/components/premium/ProjectSelector";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MotionPage } from "@/components/premium/MotionPage";
import { getProjectBundle, getProjects } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";
import { formatDate } from "@/lib/utils";

type CalendarView = "day" | "week" | "month";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ projectId?: string; view?: string; date?: string; detail?: string }> }) {
  const params = await searchParams;
  const tenant = await getTenantContext({ required: true });
  const projects = tenant ? await getProjects(tenant.organizationId) : [];
  const selectedProjectId = params.projectId || (projects[0]?._id ? String(projects[0]._id) : "");
  const view = ["day", "week", "month"].includes(params.view || "") ? (params.view as CalendarView) : "week";
  const activeDate = params.date ? new Date(params.date) : new Date();
  const bundle = tenant && selectedProjectId ? await getProjectBundle(tenant.organizationId, selectedProjectId) : null;
  const events = bundle ? buildCalendarEvents(bundle) : [];
  const visibleEvents = filterEvents(events, view, activeDate);
  const selectedEvent = events.find((event) => event.id === params.detail);

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Calendar" title="Project work status calendar">
          <CalendarDays className="h-6 w-6 text-blueprint" aria-hidden="true" />
        </SectionHeader>
        <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <ProjectSelector projects={projects} selectedProjectId={selectedProjectId} />
            <div className="flex flex-wrap gap-2">
              {(["day", "week", "month"] as CalendarView[]).map((item) => (
                <Link
                  key={item}
                  className={`inline-flex h-11 items-center rounded-2xl px-4 text-sm font-black transition ${view === item ? "bg-slate-950 text-white shadow-glow dark:bg-safety-yellow dark:text-slate-950" : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white"}`}
                  href={`/calendar?projectId=${selectedProjectId}&view=${item}`}
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </Link>
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Week view is the default. Calendar items are filtered to the selected project only.
          </p>
        </div>

        {!bundle ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
            <p className="text-lg font-black text-slate-950">Select a project to view work status</p>
            <p className="mt-2 text-sm text-slate-500">Tasks, schedule, attendance, materials, bills, and daily progress will appear here.</p>
          </div>
        ) : (
          <>
            <CalendarGrid view={view} date={activeDate} events={visibleEvents} projectId={selectedProjectId} />
            {selectedEvent ? <CalendarDetail event={selectedEvent} /> : null}
          </>
        )}
      </MotionPage>
    </AppShell>
  );
}

function buildCalendarEvents(bundle: any) {
  const projectName = bundle.project?.name || "Project";
  const base = { projectName, projectId: String(bundle.project?._id) };
  const eventRows = [
    ...(bundle.tasks || []).map((row: any) => ({
      ...base,
      id: `task-${row._id}`,
      date: row.dueDate || row.startDate,
      type: "Task",
      title: row.title || "Task",
      status: row.status || "Not Started",
      assignedWorkers: row.assignedWorkers || row.assignedTo || "-",
      materials: row.requiredMaterials || "-",
      progress: `${Number(row.completionPercentage || row.progress || 0)}%`,
      pending: row.status === "Completed" ? "-" : row.description || "Pending task work",
      completed: row.status === "Completed" ? row.title : "-",
      issues: row.delayReason || "-",
      href: `/projects/${base.projectId}/tasks`
    })),
    ...(bundle.schedule || []).map((row: any) => ({
      ...base,
      id: `schedule-${row._id}`,
      date: row.startDate,
      type: "Schedule",
      title: row.taskName || "Schedule item",
      status: row.status || "Not Started",
      assignedWorkers: row.assignedUserId ? "Assigned user" : "-",
      materials: "-",
      progress: `${Number(row.progress || 0)}%`,
      pending: row.notes || "-",
      completed: row.status === "Completed" ? row.taskName : "-",
      issues: row.delayReason || "-",
      href: `/projects/${base.projectId}/schedule`
    })),
    ...(bundle.progress || []).map((row: any) => ({
      ...base,
      id: `progress-${row._id}`,
      date: row.date || row.createdAt,
      type: "Daily Progress",
      title: row.workCompleted || "Daily progress",
      status: row.delayReason ? "Needs attention" : "Updated",
      assignedWorkers: row.workersPresent ? `${row.workersPresent} worker(s)` : "-",
      materials: Array.isArray(row.materialsUsed) ? `${row.materialsUsed.length} material record(s)` : "-",
      progress: row.quantityCompleted ? `${row.quantityCompleted} ${row.unit || ""}` : "-",
      pending: row.issuesFaced || "-",
      completed: row.workCompleted || "-",
      issues: row.delayReason || row.issuesFaced || "-",
      href: `/projects/${base.projectId}/daily-progress`
    })),
    ...(bundle.materialTransactions || []).map((row: any) => ({
      ...base,
      id: `material-${row._id}`,
      date: row.dateTime || row.createdAt,
      type: "Material",
      title: row.materialName || "Material entry",
      status: row.transactionType || "Material",
      assignedWorkers: "-",
      materials: `${row.quantity || 0} @ ${row.unitRate || 0}`,
      progress: row.totalCost ? `₹${Number(row.totalCost).toLocaleString("en-IN")}` : "-",
      pending: row.transactionType === "Purchase/Inward" ? "Stock received" : "Material movement",
      completed: row.remarks || "-",
      issues: Number(row.expectedRate || 0) > 0 && Number(row.unitRate || 0) > Number(row.expectedRate || 0) ? "Price exceeds expected rate" : "-",
      href: `/projects/${base.projectId}/materials`
    })),
    ...(bundle.bills || []).map((row: any) => ({
      ...base,
      id: `bill-${row._id}`,
      date: row.dueDate || row.billDate,
      type: "Bill",
      title: row.billNumber || "Bill",
      status: row.status || "Draft",
      assignedWorkers: "-",
      materials: "-",
      progress: row.netPayable ? `₹${Number(row.netPayable).toLocaleString("en-IN")}` : "-",
      pending: row.status === "Paid" ? "-" : "Payment follow-up",
      completed: row.status === "Paid" ? "Paid" : "-",
      issues: row.status === "Overdue" ? "Bill overdue" : "-",
      href: `/projects/${base.projectId}/bills`
    }))
  ];

  return eventRows.filter((event) => event.date && !Number.isNaN(new Date(event.date).getTime()));
}

function filterEvents(events: any[], view: CalendarView, activeDate: Date) {
  const start = new Date(activeDate);
  start.setHours(0, 0, 0, 0);
  if (view === "week") start.setDate(start.getDate() - start.getDay());
  if (view === "month") start.setDate(1);
  const end = new Date(start);
  if (view === "day") end.setDate(start.getDate() + 1);
  if (view === "week") end.setDate(start.getDate() + 7);
  if (view === "month") end.setMonth(start.getMonth() + 1);
  return events.filter((event) => {
    const date = new Date(event.date);
    return date >= start && date < end;
  });
}

function CalendarGrid({ view, date, events, projectId }: { view: CalendarView; date: Date; events: any[]; projectId: string }) {
  const columns = view === "day" ? 1 : view === "week" ? 7 : 7;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  if (view === "week") start.setDate(start.getDate() - start.getDay());
  if (view === "month") start.setDate(1 - start.getDay());
  const days = Array.from({ length: view === "day" ? 1 : view === "week" ? 7 : 35 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blueprint">{view} view</p>
          <h2 className="mt-1 text-2xl font-black">{formatDate(date.toISOString())}</h2>
        </div>
        <p className="text-sm font-bold text-slate-500">{events.length} project-specific calendar item(s)</p>
      </div>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {days.map((day) => {
          const dayEvents = events.filter((event) => new Date(event.date).toDateString() === day.toDateString());
          return (
            <div key={day.toISOString()} className="min-h-40 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-black text-slate-950 dark:text-white">{day.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit" })}</p>
              <div className="mt-3 grid gap-2">
                {dayEvents.length ? dayEvents.map((event) => (
                  <Link key={event.id} className="block rounded-2xl bg-white p-3 text-left text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow dark:bg-slate-950" href={`/calendar?projectId=${projectId}&view=${view}&date=${date.toISOString().slice(0, 10)}&detail=${event.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-slate-950 dark:text-white">{event.title}</p>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-1 font-semibold text-slate-500">{event.projectName} · {event.type}</p>
                    <StatusBadge status={event.status} />
                  </Link>
                )) : <p className="text-xs font-semibold text-slate-400">No work items</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CalendarDetail({ event }: { event: any }) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blueprint">Calendar detail</p>
          <h2 className="mt-2 text-2xl font-black">{event.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{event.projectName} · {event.type} · {formatDate(event.date)}</p>
        </div>
        <Link className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white dark:bg-safety-yellow dark:text-slate-950" href={event.href}>Open related section</Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Detail label="Work status" value={event.status} />
        <Detail label="Assigned workers" value={event.assignedWorkers} />
        <Detail label="Materials used/required" value={event.materials} />
        <Detail label="Progress update" value={event.progress} />
        <Detail label="Pending work" value={event.pending} />
        <Detail label="Completed work" value={event.completed} />
        <Detail label="Issues/blockers" value={event.issues} />
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-100">{String(value || "-")}</p>
    </div>
  );
}
