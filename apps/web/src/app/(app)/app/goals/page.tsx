import type { Metadata } from "next";
import { GoalList } from "@/components/goals/goal-list";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your goals shape what the AI recommends. Higher priority = more weight.
        </p>
      </div>
      <GoalList />
    </div>
  );
}
