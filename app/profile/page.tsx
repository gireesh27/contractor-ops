import { UserCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { Organization, User } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export default async function ProfilePage() {
  const tenant = await getTenantContext({ required: true });
  const [user, organization] = tenant?.databaseReady
    ? await Promise.all([
        User.findOne({ _id: objectId(tenant.userId), deletedAt: null }).lean(),
        Organization.findOne({ _id: objectId(tenant.organizationId), deletedAt: null }).lean()
      ])
    : [null, null];

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Profile" title="Account, organization, and preferences">
          <div className="rounded-2xl bg-blueprint p-3 text-white">
            <UserCircle className="h-5 w-5" aria-hidden="true" />
          </div>
        </SectionHeader>
        <ProfileSettingsForm
          organization={{
            name: String(organization?.name || tenant?.organizationName || ""),
            gstNumber: String(organization?.gstNumber || ""),
            city: String(organization?.city || ""),
            state: String(organization?.state || "")
          }}
          role={tenant?.role || "Viewer"}
          user={{
            name: String(user?.name || tenant?.userName || ""),
            email: String(user?.email || tenant?.userEmail || ""),
            phone: String(user?.phone || ""),
            image: String(user?.image || "")
          }}
        />
      </MotionPage>
    </AppShell>
  );
}
