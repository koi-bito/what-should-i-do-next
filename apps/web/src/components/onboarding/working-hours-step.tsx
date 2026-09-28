"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

interface WorkingHoursStepProps {
  onComplete: () => void;
}

export function WorkingHoursStep({ onComplete }: WorkingHoursStepProps) {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch("/users/me", {
        timezone,
        workingHours: { start, end },
      });
      onComplete();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} id="onboarding-hours-form" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">When do you usually work?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us understand your context without asking every time.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Working hours</label>
          <div className="flex items-center gap-3">
            <input type="time" id="work-start-onboard" value={start} onChange={(e) => setStart(e.target.value)} className="input-base flex-1" />
            <span className="text-muted-foreground text-sm flex-shrink-0">to</span>
            <input type="time" id="work-end-onboard" value={end} onChange={(e) => setEnd(e.target.value)} className="input-base flex-1" />
          </div>
        </div>

        <div>
          <label htmlFor="timezone-onboard" className="block text-sm font-medium text-muted-foreground mb-2">Timezone</label>
          <input
            id="timezone-onboard"
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="input-base"
            placeholder="e.g. America/New_York"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-detected from your browser</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onComplete} className="btn-ghost flex-1">Skip</button>
        <button type="submit" id="save-hours-btn" className="btn-primary flex-1" disabled={isSaving}>
          {isSaving ? "Saving..." : "Continue →"}
        </button>
      </div>
    </form>
  );
}
