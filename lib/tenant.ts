import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { Organization, OrganizationMember, User } from "@/lib/db/models";

export interface TenantContext {
  userId: string;
  organizationId: string;
  role: string;
  userName?: string | null;
  userEmail?: string | null;
  organizationName: string;
  databaseReady: boolean;
}

export async function getTenantContext(options: { required?: boolean } = {}): Promise<TenantContext | null> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    if (options.required) redirect("/login");
    return null;
  }

  const db = await connectToDatabase();
  if (!db) {
    return {
      userId: session.user.id,
      organizationId: session.user.organizationId,
      role: session.user.role,
      userName: session.user.name,
      userEmail: session.user.email,
      organizationName: "Database not connected",
      databaseReady: false
    };
  }

  const [organization, membership, user] = await Promise.all([
    Organization.findOne({ _id: session.user.organizationId, deletedAt: null }).lean(),
    OrganizationMember.findOne({
      organizationId: session.user.organizationId,
      userId: session.user.id
    }).lean(),
    User.findOne({ _id: session.user.id, deletedAt: null }).lean()
  ]);

  if (!organization || !membership) {
    if (options.required) redirect("/unauthorized");
    return null;
  }

  return {
    userId: String(session.user.id),
    organizationId: String(session.user.organizationId),
    role: String(membership.role || session.user.role),
    userName: user?.name || session.user.name,
    userEmail: user?.email || session.user.email,
    organizationName: String(organization.name || "ContractorOps"),
    databaseReady: true
  };
}
