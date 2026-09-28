import type { Metadata } from "next";
import { NextActionFlow } from "@/components/next-action/next-action-flow";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { getUsageSummary } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Get your next action",
};

export default async function DashboardPage() {
  const usage = await getUsageSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          What should you do next?
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us where you're at — get one clear answer.
        </p>
      </div>

      <NextActionFlow />

      <QuickStats
        streak={usage.streak}
        queriesRemaining={usage.queriesRemaining}
        todayCompleted={usage.todayCompleted}
      />
    </div>
  );
}
