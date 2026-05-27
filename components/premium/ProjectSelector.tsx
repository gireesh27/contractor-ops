"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProjectSelector({
  projects,
  selectedProjectId,
  label = "Filter by project"
}: {
  projects: Array<{ _id?: string; id?: string; name?: string; clientName?: string }>;
  selectedProjectId?: string;
  label?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("projectId", value);
    else next.delete("projectId");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700">
      {label}
      <select
        className="h-12 min-w-64 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        onChange={(event) => onChange(event.target.value)}
        value={selectedProjectId || ""}
      >
        <option value="">All projects</option>
        {projects.map((project) => {
          const id = String(project._id || project.id || "");
          return (
            <option key={id} value={id}>
              {project.name || "Untitled project"}{project.clientName ? ` - ${project.clientName}` : ""}
            </option>
          );
        })}
      </select>
    </label>
  );
}
