"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BadgeIndianRupee,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  Camera,
  ChevronLeft,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FileText,
  FolderOpen,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ReceiptText,
  Ruler,
  Search,
  Settings,
  Shield,
  Sun,
  Truck,
  UserCircle,
  WalletCards,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "contractorops-theme";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
      "Viewer",
      "Member",
    ],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: Building2,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
      "Viewer",
      "Member",
    ],
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: Clock3,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
    ],
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: ClipboardCheck,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
    ],
  },
  {
    href: "/boq",
    label: "BOQ & Estimates",
    icon: FileText,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
    ],
  },
  {
    href: "/daily-progress",
    label: "Daily Progress",
    icon: Wrench,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
    ],
  },
  {
    href: "/labour",
    label: "Labour",
    icon: HardHat,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Site Engineer",
      "Accountant",
    ],
  },
  {
    href: "/materials",
    label: "Materials",
    icon: Package,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Site Engineer",
      "Project Manager",
    ],
  },
  {
    href: "/equipment",
    label: "Equipment",
    icon: Truck,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Site Engineer",
      "Project Manager",
    ],
  },
  {
    href: "/measurements",
    label: "Measurements",
    icon: Ruler,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
    ],
  },
  {
    href: "/bills",
    label: "Bills",
    icon: ReceiptText,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Accountant",
    ],
  },
  {
    href: "/payments",
    label: "Payments",
    icon: WalletCards,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Accountant",
    ],
  },
  {
    href: "/vendors",
    label: "Vendors",
    icon: Truck,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Accountant",
    ],
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: BadgeIndianRupee,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Accountant",
    ],
  },
  {
    href: "/site-photos",
    label: "Site Photos",
    icon: Camera,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
    ],
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
    ],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
      "Viewer",
      "Member",
    ],
  },
  {
    href: "/ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
    ],
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarDays,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
    ],
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
      "Project Manager",
      "Site Engineer",
      "Accountant",
      "Viewer",
      "Member",
    ],
  },
  {
    href: "/billing",
    label: "Subscription",
    icon: CreditCard,
    roles: ["Super Admin", "Organization Owner", "Owner"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: [
      "Super Admin",
      "Organization Owner",
      "Organization Admin",
      "Owner",
      "Admin",
    ],
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Shield,
    roles: ["Super Admin"],
  },
];

function getInitials(name?: string | null) {
  if (!name) return "CO";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({
  children,
  organizationName,
  userName,
  userImage,
  role,
  databaseReady,
}: {
  children: React.ReactNode;
  organizationName: string;
  userName?: string | null;
  userImage?: string | null;
  role: string;
  databaseReady: boolean;
}) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("light");

  const [reveal, setReveal] = useState<{
    x: number;
    y: number;
    dark: boolean;
  } | null>(null);

  const items = useMemo(() => {
    return navItems.filter((item) => item.roles.includes(role));
  }, [role]);

  const bottomItems = useMemo(() => {
    const preferred = ["/dashboard", "/projects", "/tasks", "/calendar", "/reports"];

    return preferred
      .map((href) => items.find((item) => item.href === href))
      .filter(Boolean)
      .slice(0, 5) as typeof navItems;
  }, [items]);

  useEffect(() => {
    const update = () => {
      setDateTime(
        new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date()),
      );
    };

    update();

    const timer = window.setInterval(update, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as ThemeMode | null;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialTheme: ThemeMode = storedTheme ?? (prefersDark ? "dark" : "light");

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";

    setReveal(null);

    window.requestAnimationFrame(() => {
      setReveal({
        x: event.clientX,
        y: event.clientY,
        dark: next === "dark",
      });

      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);

      window.setTimeout(() => {
        setReveal(null);
      }, 950);
    });
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={cn(
        "flex h-full flex-col",
        "bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,.98),rgba(248,250,252,.96))]",
        "dark:bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,.10),transparent_30%),linear-gradient(180deg,rgba(2,6,23,.98),rgba(15,23,42,.98))]",
      )}
    >
      <div className="flex h-20 shrink-0 items-center justify-between px-4">
        <Link
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-2xl transition",
            "focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-yellow-400/15",
          )}
          href="/dashboard"
          onClick={() => mobile && setDrawerOpen(false)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-safety-yellow text-sm font-black text-graphite shadow-sm">
            CO
          </span>

          {!collapsed || mobile ? (
            <span className="min-w-0">
              <span className="block truncate text-lg font-black text-slate-950 dark:text-white">
                ContractorOps
              </span>
              <span className="block truncate text-xs font-semibold text-slate-500 dark:text-white/50">
                Site-to-bill command center
              </span>
            </span>
          ) : null}
        </Link>

        {mobile ? (
          <button
            className={cn(
              "rounded-2xl p-2 transition",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              "dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-safety-yellow",
            )}
            onClick={() => setDrawerOpen(false)}
            type="button"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
          <button
            className={cn(
              "rounded-2xl p-2 transition",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
              "dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-safety-yellow",
            )}
            onClick={() => setCollapsed((value) => !value)}
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <nav className="premium-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200",
                "focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10",

                "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                "dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-safety-yellow",

                active &&
                  "bg-slate-950 text-white shadow-glow hover:bg-slate-950 hover:text-white",
                active &&
                  "dark:bg-safety-yellow dark:text-graphite dark:hover:bg-safety-yellow dark:hover:text-graphite",

                collapsed && !mobile && "justify-center px-2",
              )}
              href={item.href}
              onClick={() => mobile && setDrawerOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-all duration-200",

                  !active &&
                    "text-slate-400 group-hover:text-blueprint dark:text-white/45 dark:group-hover:text-safety-yellow",

                  active && "text-safety-yellow dark:text-graphite",
                )}
                aria-hidden="true"
              />

              {!collapsed || mobile ? (
                <span className="truncate">{item.label}</span>
              ) : null}

              {active && (!collapsed || mobile) ? (
                <span className="ml-auto h-2 w-2 rounded-full bg-safety-yellow dark:bg-graphite" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200/80 p-3 dark:border-white/10">
        <Link
          className={cn(
            "mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200",
            "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            "dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-safety-yellow",
            collapsed && !mobile && "justify-center px-2",
          )}
          href="/profile"
          onClick={() => mobile && setDrawerOpen(false)}
          title={collapsed && !mobile ? "Profile & account" : undefined}
        >
          <UserCircle
            className="h-5 w-5 shrink-0 text-blueprint dark:text-safety-yellow"
            aria-hidden="true"
          />

          {!collapsed || mobile ? (
            <span className="truncate">Profile & account</span>
          ) : null}
        </Link>

        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-200",
            "text-slate-600 hover:bg-red-50 hover:text-red-600",
            "dark:text-white/70 dark:hover:bg-red-500/15 dark:hover:text-red-300",
            collapsed && !mobile && "justify-center px-2",
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
          type="button"
          title={collapsed && !mobile ? "Logout" : undefined}
        >
          <LogOut
            className="h-5 w-5 shrink-0 text-red-500 dark:text-red-300"
            aria-hidden="true"
          />

          {!collapsed || mobile ? <span className="truncate">Logout</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "min-h-screen text-slate-950 transition-colors duration-300 dark:text-white",
        "bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,.18),transparent_28%),linear-gradient(180deg,#f8fafc,#eef2f7)]",
        "dark:bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,.12),transparent_30%),linear-gradient(180deg,#020617,#0f172a)]",
      )}
    >
      {reveal ? (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
          <div
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 animate-theme-corner-reveal rounded-full",
              reveal.dark ? "bg-[#020617]" : "bg-white",
            )}
            style={{
              left: reveal.x,
              top: reveal.y,
            }}
          />

          <div
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 animate-theme-corner-glow rounded-full blur-2xl",
              reveal.dark ? "bg-safety-yellow/25" : "bg-blueprint/20",
            )}
            style={{
              left: reveal.x,
              top: reveal.y,
            }}
          />

          <div
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 animate-theme-corner-wave rounded-full blur-xl",
              reveal.dark ? "bg-safety-yellow/15" : "bg-safety-yellow/20",
            )}
            style={{
              left: reveal.x,
              top: reveal.y,
            }}
          />
        </div>
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r shadow-glass transition-all duration-300 lg:block",
          "border-slate-200/80 bg-white text-slate-950",
          "dark:border-white/10 dark:bg-slate-950 dark:text-white",
          collapsed ? "w-20" : "w-72",
        )}
      >
        <SidebarContent />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            type="button"
            aria-label="Close menu backdrop"
          />

          <aside
            className={cn(
              "relative h-full w-80 max-w-[86vw] overflow-hidden border-r shadow-2xl",
              "border-slate-200 bg-white text-slate-950",
              "dark:border-white/10 dark:bg-slate-950 dark:text-white",
            )}
          >
            <SidebarContent mobile />
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-72",
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-30 border-b px-4 py-3 shadow-sm backdrop-blur-2xl transition-colors duration-300 lg:px-6",
            "border-white/70 bg-white/75",
            "dark:border-white/10 dark:bg-slate-950/75",
          )}
        >
          <div className="flex items-center gap-3">
            <button
              className={cn(
                "rounded-2xl border p-2 transition lg:hidden",
                "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                "dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-safety-yellow",
              )}
              onClick={() => setDrawerOpen(true)}
              type="button"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative hidden flex-1 md:block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/35"
                aria-hidden="true"
              />

              <input
                className={cn(
                  "h-12 w-full rounded-2xl border pl-11 pr-4 text-sm font-semibold outline-none transition",
                  "border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400",
                  "focus:border-blueprint focus:ring-4 focus:ring-blue-500/10",
                  "dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40",
                  "dark:focus:border-safety-yellow dark:focus:ring-yellow-400/10",
                )}
                placeholder="Search projects, bills, vendors, reports..."
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  "hidden rounded-full px-3 py-1 text-xs font-black md:inline-flex",
                  databaseReady
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                )}
              >
                {databaseReady ? "MongoDB live" : "DB setup needed"}
              </span>

              <span
                className={cn(
                  "hidden rounded-full px-3 py-1 text-xs font-black xl:inline-flex",
                  "bg-slate-950 text-safety-yellow",
                  "dark:bg-white/10 dark:text-safety-yellow",
                )}
              >
                {dateTime}
              </span>

              <button
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border shadow-sm",
                  "border-slate-200 bg-white text-slate-600",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-0.5 hover:bg-slate-100 hover:text-blueprint hover:shadow-md",
                  "active:translate-y-0 active:scale-95",
                  "dark:border-white/10 dark:bg-white/10 dark:text-white/70",
                  "dark:hover:border-safety-yellow/40 dark:hover:bg-safety-yellow/10 dark:hover:text-safety-yellow",
                )}
                onClick={toggleTheme}
                type="button"
                aria-label="Toggle dark mode"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-safety-yellow/20 via-transparent to-blueprint/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <Sun
                  className={cn(
                    "absolute h-4 w-4 transition-all duration-500 ease-out",
                    theme === "dark"
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0",
                  )}
                  aria-hidden="true"
                />

                <Moon
                  className={cn(
                    "absolute h-4 w-4 transition-all duration-500 ease-out",
                    theme === "dark"
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100",
                  )}
                  aria-hidden="true"
                />
              </button>

              <Link
                className={cn(
                  "relative hidden h-11 w-11 items-center justify-center rounded-2xl border transition sm:flex",
                  "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-blueprint",
                  "dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-safety-yellow",
                )}
                href="/notifications"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-950" />
              </Link>

              <Link
                className={cn(
                  "hidden h-11 items-center rounded-2xl px-4 text-sm font-black shadow-glow transition xl:inline-flex",
                  "bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-slate-800",
                  "dark:bg-safety-yellow dark:text-graphite dark:hover:bg-yellow-300",
                )}
                href="/projects/new"
              >
                Quick action
              </Link>

              <Link
                className={cn(
                  "flex h-11 items-center gap-3 rounded-2xl border px-2.5 transition sm:h-12 sm:px-3",
                  "border-slate-200 bg-white hover:border-blueprint hover:bg-slate-50",
                  "dark:border-white/10 dark:bg-white/10 dark:hover:border-safety-yellow/40 dark:hover:bg-white/15",
                )}
                href="/profile"
              >
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={userName || "User"}
                    className="h-8 w-8 rounded-xl object-cover ring-2 ring-white dark:ring-white/10"
                    src={userImage}
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueprint text-xs font-black text-white dark:bg-safety-yellow dark:text-graphite">
                    {getInitials(userName)}
                  </span>
                )}

                <span className="hidden sm:block">
                  <span className="block max-w-32 truncate text-sm font-black text-slate-950 dark:text-white lg:max-w-40">
                    {organizationName}
                  </span>
                  <span className="block max-w-32 truncate text-xs font-semibold text-slate-500 dark:text-white/50 lg:max-w-40">
                    {role}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 pb-28 sm:px-5 md:px-6 lg:px-7 lg:pb-8">
          {children}
        </main>

        <nav
          className={cn(
            "fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.5rem] border p-2 shadow-glass backdrop-blur-2xl lg:hidden",
            "border-white/70 bg-white/90",
            "dark:border-white/10 dark:bg-slate-950/88",
          )}
        >
          {bottomItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black transition",
                  "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                  "dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-safety-yellow",
                  active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                  active &&
                    "dark:bg-safety-yellow dark:text-graphite dark:hover:bg-safety-yellow dark:hover:text-graphite",
                )}
                href={item.href}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active
                      ? "text-safety-yellow dark:text-graphite"
                      : "text-slate-400 dark:text-white/45",
                  )}
                  aria-hidden="true"
                />

                <span className="w-full truncate text-center">
                  {item.label.split(" ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}