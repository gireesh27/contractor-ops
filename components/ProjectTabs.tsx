import Link from "next/link";

const tabs = [
  { href: "", label: "Overview" },
  { href: "/tasks", label: "Tasks / Activities" },
  { href: "/labour", label: "Workers / Attendance" },
  { href: "/materials", label: "Materials" },
  { href: "/measurements", label: "Measurements" },
  { href: "/boq", label: "BOQ" },
  { href: "/boq", label: "Estimates" },
  { href: "/daily-progress", label: "Daily Progress" },
  { href: "/bills", label: "Bills" },
  { href: "/expenses", label: "Vendor Bills" },
  { href: "/reports", label: "Records" },
  { href: "/calendar", label: "Calendar" },
  { href: "/ai-summary", label: "AI Insights" },
  { href: "/photos", label: "Photos" },
  { href: "/payments", label: "Payments" },
  { href: "/equipment", label: "Equipment" },
  { href: "/documents", label: "Documents" },
  { href: "/schedule", label: "Schedule" }
];

export function ProjectTabs({ projectId }: { projectId: string }) {
  return (
    <nav className="premium-scrollbar flex gap-2 overflow-x-auto rounded-[1.5rem] border border-white/80 bg-white/85 p-2 shadow-sm backdrop-blur-xl">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          className="inline-flex h-11 shrink-0 items-center rounded-2xl px-4 text-sm font-black text-slate-600 transition hover:bg-slate-950 hover:text-white"
          href={`/projects/${projectId}${tab.href}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
