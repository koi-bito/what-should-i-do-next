import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Stop deciding. Start doing. Free forever, or upgrade for unlimited access.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="font-semibold text-foreground">WhatNext?</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">Get started free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 animate-fade-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Stop deciding. <span className="text-gradient">Start doing.</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            No credit card required. Free forever.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Free */}
          <div className="card p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Free</p>
              <p className="text-4xl font-bold text-foreground">$0</p>
              <p className="text-sm text-muted-foreground mt-1">Forever</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Enough to get unstuck when it matters most.
            </p>
            <ul className="space-y-3 text-sm flex-1 mb-8">
              {[
                "5 questions per day",
                "Manual context input",
                "Full query history",
                "Accept / reject / snooze",
                "Task & goal management",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-secondary w-full text-center py-3 text-sm block">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="card p-8 flex flex-col border-primary/40 bg-primary/5 shadow-card-primary relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-primary px-4 py-1.5 text-sm">
              Most popular
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pro</p>
              <p className="text-4xl font-bold text-foreground">$8<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              For when "stuck" happens more than 5 times a day.
            </p>
            <ul className="space-y-3 text-sm flex-1 mb-8">
              {[
                "Unlimited queries",
                "Google Calendar sync",
                "Todoist / Notion import",
                "Daily digest email",
                "Pattern learning (personalization)",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-primary w-full text-center py-3 text-sm block shadow-glow-primary">
              Start free trial
            </Link>
          </div>

          {/* Team */}
          <div className="card p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team</p>
              <p className="text-4xl font-bold text-foreground">$15<span className="text-base font-normal text-muted-foreground">/user/mo</span></p>
              <p className="text-sm text-muted-foreground mt-1">Minimum 2 seats</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Alignment without another status meeting.
            </p>
            <ul className="space-y-3 text-sm flex-1 mb-8">
              {[
                "Everything in Pro, per seat",
                "Shared goals across team",
                "Manager dashboard",
                "Member priority visibility",
                "Centralized billing",
                "Dedicated onboarding",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-success">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-secondary w-full text-center py-3 text-sm block">
              Contact sales
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Do I need a credit card to sign up?", a: "No. The free tier is free forever, no card required." },
              { q: "How does the AI decide what to suggest?", a: "We look at your goals, open tasks, energy level, available time, and recent history — then Claude picks the single best next action, with a reasoning explanation." },
              { q: "What happens when I hit my 5 queries/day limit?", a: "You'll see an upgrade prompt. Your data and history are preserved — nothing resets." },
              { q: "Can I connect my existing task apps?", a: "Yes — Google Calendar and Todoist/Notion sync is available on Pro. We read your data to provide better suggestions; we never write to your external apps." },
              { q: "How do I delete my account and data?", a: "One click in Settings → Danger Zone. All your data is permanently deleted immediately." },
            ].map((faq) => (
              <div key={faq.q} className="card p-5">
                <p className="font-semibold text-foreground text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
