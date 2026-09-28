import type { Metadata } from "next";
import { TaskList } from "@/components/tasks/task-list";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your open tasks — these feed directly into AI suggestions.
        </p>
      </div>
      <TaskList />
    </div>
  );
}
