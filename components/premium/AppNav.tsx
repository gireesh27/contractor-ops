"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  Moon,
  Package,
  ReceiptText,
  Ruler,
  Search,
  Settings,
  Shield,
  Truck,
  WalletCards,
  Wrench,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant", "Viewer"] },
  { href: "/projects", label: "Projects", icon: Building2, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant", "Viewer"] },
  { href: "/schedule", label: "Schedule", icon: Clock3, roles: ["Owner", "Admin", "Project Manager"] },
  { href: "/tasks", label: "Tasks", icon: ClipboardCheck, roles: ["Owner", "Admin", "Project Manager", "Site Engineer"] },
  { href: "/boq", label: "BOQ & Estimates", icon: FileText, roles: ["Owner", "Admin", "Project Manager"] },
  { href: "/daily-progress", label: "Daily Progress", icon: Wrench, roles: ["Owner", "Admin", "Project Manager", "Site Engineer"] },
  { href: "/labour", label: "Labour", icon: HardHat, roles: ["Owner", "Admin", "Site Engineer", "Accountant"] },
  { href: "/materials", label: "Materials", icon: Package, roles: ["Owner", "Admin", "Site Engineer", "Project Manager"] },
  { href: "/equipment", label: "Equipment", icon: Truck, roles: ["Owner", "Admin", "Site Engineer", "Project Manager"] },
  { href: "/measurements", label: "Measurements", icon: Ruler, roles: ["Owner", "Admin", "Project Manager", "Site Engineer"] },
  { href: "/bills", label: "Bills", icon: ReceiptText, roles: ["Owner", "Admin", "Accountant"] },
  { href: "/payments", label: "Payments", icon: WalletCards, roles: ["Owner", "Admin", "Accountant"] },
  { href: "/vendors", label: "Vendors", icon: Truck, roles: ["Owner", "Admin", "Accountant"] },
  { href: "/expenses", label: "Expenses", icon: BadgeIndianRupee, roles: ["Owner", "Admin", "Accountant"] },
  { href: "/site-photos", label: "Site Photos", icon: Camera, roles: ["Owner", "Admin", "Project Manager", "Site Engineer"] },
  { href: "/documents", label: "Documents", icon: FolderOpen, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant", "Viewer"] },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant"] },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["Owner", "Admin", "Project Manager", "Site Engineer", "Accountant", "Viewer"] },
  { href: "/billing", label: "Subscription", icon: CreditCard, roles: ["Owner"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["Owner", "Admin"] },
  { href: "/admin", label: "Admin", icon: Shield, roles: ["Owner"] }
];

const bottomItems = navItems.slice(0, 5);

export function AppNav({
  children,
  organizationName,
  userName,
  role,
  databaseReady
}: {
  children: React.ReactNode;
  organizationName: string;
  userName?: string | null;
  role: string;
  databaseReady: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const update = () =>
      setDateTime(
        new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short"
        }).format(new Date())
      );
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const items = navItems.filter((item) => item.roles.includes(role));

  const Sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-graphite text-white shadow-glass transition-all duration-300 lg:block",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex h-full flex-col bg-premium-grid bg-[length:28px_28px]">
        <div className="flex h-20 items-center justify-between px-4">
          <Link className="flex min-w-0 items-center gap-3" href="/dashboard">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-safety-yellow text-sm font-black text-graphite">CO</span>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-lg font-black">ContractorOps</span>
                <span className="block truncate text-xs text-white/55">Site-to-bill command center</span>
              </span>
            ) : null}
          </Link>
          <button className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setCollapsed(!collapsed)} type="button">
            <ChevronLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} aria-hidden="true" />
          </button>
        </div>
        <nav className="premium-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white/68 transition hover:bg-white/10 hover:text-white",
                  active && "bg-white text-graphite shadow-glow hover:bg-white hover:text-graphite"
                )}
                href={item.href}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-blueprint" : "text-white/58 group-hover:text-safety-yellow")} aria-hidden="true" />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,.16),transparent_32%),linear-gradient(180deg,#f8fafc,#eef2f7)] text-slate-950">
      {Sidebar}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 px-4 py-3 shadow-sm backdrop-blur-2xl lg:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white p-2 lg:hidden" onClick={() => setDrawerOpen(true)} type="button">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative hidden flex-1 md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" placeholder="Search projects, bills, vendors, reports..." />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={cn("hidden rounded-full px-3 py-1 text-xs font-black md:inline-flex", databaseReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                {databaseReady ? "MongoDB live" : "DB setup needed"}
              </span>
              <span className="hidden rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-safety-yellow xl:inline-flex">{dateTime}</span>
              <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 hover:text-blueprint" type="button">
                <Moon className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 hover:text-blueprint" href="/notifications">
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </Link>
              <Link className="hidden h-12 items-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-glow sm:inline-flex" href="/projects/new">
                Quick action
              </Link>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueprint text-xs font-black text-white">
                  {(userName || "CO").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                </span>
                <span className="hidden sm:block">
                  <span className="block max-w-40 truncate text-sm font-black">{organizationName}</span>
                  <span className="block text-xs font-semibold text-slate-500">{role}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden">
            <div className="h-full w-80 max-w-[86vw] bg-graphite p-4 text-white">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-lg font-black">ContractorOps</span>
                <button className="rounded-xl p-2 hover:bg-white/10" onClick={() => setDrawerOpen(false)} type="button">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav className="space-y-1">
                {items.map((item) => (
                  <Link key={item.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-white/75 hover:bg-white/10" href={item.href} onClick={() => setDrawerOpen(false)}>
                    <item.icon className="h-5 w-5 text-safety-yellow" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        ) : null}

        <main className="px-4 py-6 pb-28 lg:px-7 lg:pb-8">{children}</main>

        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.5rem] border border-white/70 bg-white/85 p-2 shadow-glass backdrop-blur-2xl lg:hidden">
          {bottomItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} className={cn("flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-black text-slate-500", active && "bg-slate-950 text-white")} href={item.href}>
                <item.icon className={cn("h-5 w-5", active && "text-safety-yellow")} aria-hidden="true" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
