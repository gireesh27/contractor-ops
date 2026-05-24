import { ModulePage } from "@/components/premium/ModulePage";

interface PageProps { params: Promise<{ id: string }> }
const fields = [
  { name: "title", label: "Report title", required: true },
  { name: "type", label: "Report type", type: "select" as const, options: ["Project summary", "Daily site report", "Weekly site report", "Monthly progress report", "BOQ report", "Measurement book report", "Labour attendance report", "Material usage report", "Photo proof report"] }
];
export default async function ProjectReportsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage collection="reports" eyebrow="Reports" fields={fields} primary="title" projectId={id} secondary="type" title="Project reports and exports" />;
}
