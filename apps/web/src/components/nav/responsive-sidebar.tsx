"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app", label: "Today", icon: "🏠", ariaLabel: "Dashboard - get your next action" },
  { href: "/app/history", label: "History", icon: "📋", ariaLabel: "View query history" },
  { href: "/app/tasks", label: "Tasks", icon: "✅", ariaLabel: "Manage your tasks" },
  { href: "/app/goals", label: "Goals", icon: "🎯", ariaLabel: "Manage your goals" },
  { href: "/app/teams", label: "Teams", icon: "👥", ariaLabel: "Manager dashboard and teams" },
  { href: "/app/settings", label: "Settings", icon: "⚙️", ariaLabel: "Account settings" },
];

export function ResponsiveSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop rail sidebar */}
      <nav
        className="hidden md:flex flex-col w-56 gap-1 p-4 border-r border-border min-h-[calc(100vh-64px)] flex-shrink-0"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon, ariaLabel }) => (
          <Link
            key={href}
            href={href}
            id={`nav-${label.toLowerCase()}`}
            aria-label={ariaLabel}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive(href)
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <span className="text-base" aria-hidden="true">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/app/settings/billing"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            aria-label="Manage your plan - currently on free tier"
          >
            <span className="badge-primary">Free</span>
            <span>5 queries/day</span>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 flex justify-around border-t border-border glass py-2 z-40"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map(({ href, label, icon, ariaLabel }) => (
          <Link
            key={href}
            href={href}
            id={`mobile-nav-${label.toLowerCase()}`}
            aria-label={ariaLabel}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center text-xs gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive(href)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <span className="text-lg" aria-hidden="true">{icon}</span>
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
