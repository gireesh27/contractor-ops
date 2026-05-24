import type { Role } from "@/lib/types";

type Permission =
  | "manage:organization"
  | "manage:projects"
  | "manage:schedule"
  | "manage:tasks"
  | "manage:boq"
  | "manage:billing"
  | "manage:payments"
  | "manage:labour"
  | "manage:materials"
  | "manage:equipment"
  | "manage:expenses"
  | "manage:documents"
  | "manage:vendors"
  | "add:site-progress"
  | "view:reports"
  | "manage:users"
  | "manage:subscription"
  | "admin:saas";

const rolePermissions: Record<Role, Permission[]> = {
  Owner: [
    "manage:organization",
    "manage:users",
    "manage:subscription",
    "manage:projects",
    "manage:schedule",
    "manage:tasks",
    "manage:boq",
    "manage:billing",
    "manage:payments",
    "manage:labour",
    "manage:materials",
    "manage:equipment",
    "manage:expenses",
    "manage:documents",
    "manage:vendors",
    "add:site-progress",
    "view:reports",
    "admin:saas"
  ],
  Admin: [
    "manage:projects",
    "manage:schedule",
    "manage:tasks",
    "manage:boq",
    "manage:billing",
    "manage:payments",
    "manage:labour",
    "manage:materials",
    "manage:equipment",
    "manage:expenses",
    "manage:documents",
    "manage:vendors",
    "add:site-progress",
    "view:reports"
  ],
  "Project Manager": ["manage:projects", "manage:schedule", "manage:tasks", "manage:boq", "add:site-progress", "view:reports"],
  "Site Engineer": ["add:site-progress", "manage:labour", "manage:materials", "manage:equipment", "manage:documents", "view:reports"],
  Accountant: ["manage:billing", "manage:payments", "manage:expenses", "manage:vendors", "view:reports"],
  Viewer: ["view:reports"]
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export const permissionMatrix = rolePermissions;
