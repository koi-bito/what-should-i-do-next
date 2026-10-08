import type { Metadata } from "next";
import { PlanCard } from "@/components/settings/plan-card";
import { CheckoutButton } from "@/components/settings/checkout-button";
import { getUsageSummary } from "@/lib/api/server";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const usage = await getUsageSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan and usage.</p>
      </div>

      <PlanCard plan={usage.tier} queriesUsed={usage.queriesUsedToday} queriesLimit={usage.queriesLimit} />

      {usage.tier === "free" && (
        <div className="card p-6">
        <h3 className="font-semibold text-foreground mb-4">Upgrade to Pro</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">$8</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground mb-6">
          {["Unlimited queries", "Priority support"].map((f) => (
            <li key={f} className="flex gap-2"><span className="text-success">✓</span>{f}</li>
          ))}
        </ul>
          <CheckoutButton plan="pro" />
        </div>
      )}
    </div>
  );
}
