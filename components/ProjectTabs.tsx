import Link from "next/link";

const tabs = [
  { href: "", label: "Overview" },
  { href: "/boq", label: "BOQ" },
  { href: "/schedule", label: "Schedule" },
  { href: "/tasks", label: "Tasks" },
  { href: "/daily-progress", label: "Daily Progress" },
  { href: "/labour", label: "Labour" },
  { href: "/materials", label: "Materials" },
  { href: "/equipment", label: "Equipment" },
  { href: "/measurements", label: "Measurements" },
  { href: "/photos", label: "Photos" },
  { href: "/bills", label: "Bills" },
  { href: "/payments", label: "Payments" },
  { href: "/expenses", label: "Expenses" },
  { href: "/documents", label: "Documents" },
  { href: "/reports", label: "Reports" },
  { href: "/ai-summary", label: "AI Summary" }
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
