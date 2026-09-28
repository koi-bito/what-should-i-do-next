"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";
import type { SessionUser } from "@/lib/auth/server";

interface TopNavProps {
  user: SessionUser;
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();

  async function handleLogout() {
    await supabaseBrowserClient.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-border glass sticky top-0 z-50 flex items-center px-6 justify-between">
      {/* Logo */}
      <Link href="/app" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
          W
        </div>
        <span className="font-semibold text-foreground text-sm hidden sm:block">WhatNext?</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Tier badge */}
        <span
          id="tier-badge"
          className={`badge text-xs hidden sm:inline-flex ${
            user.tier === "pro" || user.tier === "team"
              ? "badge-primary"
              : "border border-border text-muted-foreground"
          }`}
        >
          {user.tier === "free" ? "Free" : user.tier === "pro" ? "⭐ Pro" : "Team"}
        </span>

        {/* Avatar */}
        <Link
          href="/app/settings"
          id="user-avatar-btn"
          className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary hover:bg-primary/30 transition-colors"
        >
          {(user.displayName?.[0] ?? user.email[0]).toUpperCase()}
        </Link>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

