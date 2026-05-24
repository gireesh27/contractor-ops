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
  "Super Admin": [
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
  "Organization Owner": [
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
    "view:reports"
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
  "Organization Admin": [
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
  Viewer: ["view:reports"],
  Member: ["view:reports"]
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[normalizeRole(role)].includes(permission);
}

export const permissionMatrix = rolePermissions;

export function normalizeRole(role?: string | null): Role {
  if (role === "Super Admin") return "Super Admin";
  if (role === "Organization Owner") return "Organization Owner";
  if (role === "Organization Admin") return "Organization Admin";
  if (role === "Owner") return "Organization Owner";
  if (role === "Admin") return "Organization Admin";
  if (role === "Project Manager" || role === "Site Engineer" || role === "Accountant" || role === "Viewer" || role === "Member") {
    return role;
  }
  return "Viewer";
}

export function isPlatformAdmin(role?: string | null, isSuperAdmin?: boolean) {
  return Boolean(isSuperAdmin || normalizeRole(role) === "Super Admin");
}

export function collectionPermission(collection: string, method: "GET" | "POST" | "PATCH" | "DELETE"): Permission {
  if (method === "GET") return "view:reports";
  const map: Record<string, Permission> = {
    projects: "manage:projects",
    clients: "manage:projects",
    boq: "manage:boq",
    schedule: "manage:schedule",
    tasks: "manage:tasks",
    "daily-progress": "add:site-progress",
    labour: "manage:labour",
    workers: "manage:labour",
    materials: "manage:materials",
    "material-transactions": "manage:materials",
    equipment: "manage:equipment",
    measurements: "add:site-progress",
    bills: "manage:billing",
    payments: "manage:payments",
    vendors: "manage:vendors",
    expenses: "manage:expenses",
    photos: "add:site-progress",
    documents: "manage:documents",
    reports: "view:reports",
    notifications: "manage:organization",
    subscriptions: "manage:subscription"
  };
  return map[collection] || "manage:organization";
}
