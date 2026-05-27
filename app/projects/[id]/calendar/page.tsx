import { redirect } from "next/navigation";

export default async function ProjectCalendarRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/calendar?projectId=${id}&view=week`);
}
