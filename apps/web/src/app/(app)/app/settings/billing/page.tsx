import type { Metadata } from "next";
import { PlanCard } from "@/components/settings/plan-card";
import Link from "next/link";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and usage.</p>
      </div>

      <PlanCard plan="free" queriesUsed={3} queriesLimit={5} />

      <div className="card p-6">
        <h3 className="font-semibold text-foreground mb-4">Upgrade to Pro</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">$8</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground mb-6">
          {["Unlimited queries", "Google Calendar sync", "Todoist/Notion import", "Daily digest email", "Priority support"].map((f) => (
            <li key={f} className="flex gap-2"><span className="text-success">✓</span>{f}</li>
          ))}
        </ul>
        <Link href="/pricing" className="btn-primary inline-block text-sm py-2.5 px-6 shadow-glow-primary">
          Upgrade now →
        </Link>
      </div>
    </div>
  );
}
