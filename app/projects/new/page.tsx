import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { MotionPage } from "@/components/premium/MotionPage";
import { projectFields } from "@/lib/module-config";

export default function NewProjectPage() {
  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Projects" title="Create production project" />
        <CrudForm collection="projects" fields={projectFields} />
      </MotionPage>
    </AppShell>
  );
}
