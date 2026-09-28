import type { Metadata } from "next";
import { HistoryList } from "@/components/history/history-list";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your past queries and actions.
        </p>
      </div>
      <HistoryList />
    </div>
  );
}
