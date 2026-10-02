"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";

export function ProfileSettings() {
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch("/users/me", {
        displayName: displayName || undefined,
        timezone,
        workingHours: { start: workStart, end: workEnd },
      });
      success("Profile saved successfully");
    } catch (err: any) {
      error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} id="profile-settings-form" className="space-y-5" aria-label="Profile settings">
      <div>
        <label htmlFor="display-name" className="block text-sm font-medium text-muted-foreground mb-2">Display name</label>
        <input id="display-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-base" placeholder="Your name" maxLength={80} />
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-muted-foreground mb-2">Timezone</label>
        <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-base" aria-label="Select timezone">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern (ET)</option>
          <option value="America/Chicago">Central (CT)</option>
          <option value="America/Denver">Mountain (MT)</option>
          <option value="America/Los_Angeles">Pacific (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
          <option value="Asia/Kolkata">India (IST)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Australia/Sydney">Sydney (AEST)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Working hours</label>
        <div className="flex items-center gap-3">
          <input id="work-start" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className="input-base" aria-label="Work start time" />
          <span className="text-muted-foreground text-sm">to</span>
          <input id="work-end" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className="input-base" aria-label="Work end time" />
        </div>
      </div>

      <button type="submit" id="save-profile-btn" className="btn-primary" disabled={isSaving}>
        {isSaving ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        ) : "Save changes"}
      </button>
    </form>
  );
}
