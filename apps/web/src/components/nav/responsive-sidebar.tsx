"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app", label: "Today", icon: "🏠" },
  { href: "/app/history", label: "History", icon: "📋" },
  { href: "/app/tasks", label: "Tasks", icon: "✅" },
  { href: "/app/goals", label: "Goals", icon: "🎯" },
  { href: "/app/settings", label: "Settings", icon: "⚙️" },
];

export function ResponsiveSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop rail sidebar */}
      <nav className="hidden md:flex flex-col w-56 gap-1 p-4 border-r border-border min-h-[calc(100vh-64px)] flex-shrink-0">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            id={`nav-${label.toLowerCase()}`}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              isActive(href)
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}

        <div className="mt-auto pt-4 border-t border-border">
          <Link
            href="/app/settings/billing"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <span className="badge-primary">Free</span>
            <span>5 queries/day</span>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 flex justify-around border-t border-border glass py-2 z-40">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            id={`mobile-nav-${label.toLowerCase()}`}
            className={`flex flex-col items-center text-xs gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActive(href)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
