import { Notification } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";

export async function createNotification(input: {
  organizationId: string;
  userId?: string;
  type: string;
  title: string;
  body: string;
  severity?: "info" | "success" | "warning" | "danger";
  link?: string;
}) {
  return Notification.create({
    organizationId: objectId(input.organizationId),
    userId: input.userId ? objectId(input.userId) : undefined,
    type: input.type,
    title: input.title,
    body: input.body,
    severity: input.severity || "info",
    link: input.link
  });
}

export function browserNotificationScript() {
  return `
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  `;
}
