import { Notification } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";

export async function createNotification(input: {
  organizationId: string;
  userId?: string;
  projectId?: string;
  relatedRecordId?: string;
  dedupeKey?: string;
  type: string;
  title: string;
  body: string;
  severity?: "info" | "success" | "warning" | "danger";
  link?: string;
}) {
  const payload = {
    organizationId: objectId(input.organizationId),
    userId: input.userId ? objectId(input.userId) : undefined,
    projectId: input.projectId ? objectId(input.projectId) : undefined,
    relatedRecordId: input.relatedRecordId ? objectId(input.relatedRecordId) : undefined,
    dedupeKey: input.dedupeKey,
    type: input.type,
    title: input.title,
    body: input.body,
    severity: input.severity || "info",
    link: input.link
  };

  if (input.dedupeKey) {
    return Notification.findOneAndUpdate(
      { organizationId: payload.organizationId, dedupeKey: input.dedupeKey },
      { $setOnInsert: payload },
      { upsert: true, new: true }
    );
  }

  return Notification.create(payload);
}

export function browserNotificationScript() {
  return `
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  `;
}
