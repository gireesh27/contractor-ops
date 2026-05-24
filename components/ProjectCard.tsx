import Link from "next/link";
import { MapPin, UserRound } from "lucide-react";
import { AmountDisplay } from "@/components/AmountDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { StatusBadge } from "@/components/StatusBadge";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link className="text-lg font-bold text-ink hover:text-river" href={`/projects/${project.id}`}>
            {project.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-4 w-4" aria-hidden="true" />
              {project.clientName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {project.location}
            </span>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contract value</p>
          <AmountDisplay value={project.contractValue} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated cost</p>
          <AmountDisplay value={project.estimatedCost} />
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={project.progress} label="Project progress" />
      </div>
    </article>
  );
}
