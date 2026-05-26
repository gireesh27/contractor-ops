import { UserCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { Organization, User } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

function safeString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function safeDate(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default async function ProfilePage() {
  const tenant = await getTenantContext({ required: true });

  const [user, organization] = tenant?.databaseReady
    ? await Promise.all([
        User.findOne({ _id: objectId(tenant.userId), deletedAt: null }).lean(),
        Organization.findOne({ _id: objectId(tenant.organizationId), deletedAt: null }).lean()
      ])
    : [null, null];

  const userRecord = user as Record<string, unknown> | null;
  const organizationRecord = organization as Record<string, unknown> | null;

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Settings" title="Profile, account, security, and preferences">
          <div className="rounded-2xl bg-blueprint p-3 text-white shadow-glow">
            <UserCircle className="h-5 w-5" aria-hidden="true" />
          </div>
        </SectionHeader>

        <ProfileSettingsForm
          role={tenant?.role || "Viewer"}
          user={{
            name: safeString(userRecord?.name || tenant?.userName),
            email: safeString(userRecord?.email || tenant?.userEmail),
            phone: safeString(userRecord?.phone),
            image: safeString(userRecord?.image),
            designation: safeString(userRecord?.designation),
            location: safeString(userRecord?.location),
            bio: safeString(userRecord?.bio),
            emailVerified: Boolean(userRecord?.emailVerified),
            createdAt: safeDate(userRecord?.createdAt),
            updatedAt: safeDate(userRecord?.updatedAt)
          }}
          organization={{
            name: safeString(organizationRecord?.name || tenant?.organizationName),
            gstNumber: safeString(organizationRecord?.gstNumber),
            city: safeString(organizationRecord?.city),
            state: safeString(organizationRecord?.state)
          }}
        />
      </MotionPage>
    </AppShell>
  );
}