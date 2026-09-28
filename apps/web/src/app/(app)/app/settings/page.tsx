"use client";

import { useState } from "react";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { IntegrationsSettings } from "@/components/settings/integrations-settings";
import { DangerZone } from "@/components/settings/danger-zone";

const TABS = ["Profile", "Integrations", "Danger Zone"] as const;
type Tab = typeof TABS[number];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, integrations, and account.</p>
      </div>

      {/* Tab list */}
      <div className="flex gap-1 bg-surface rounded-xl p-1 border border-border w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            id={`settings-tab-${tab.toLowerCase().replace(" ", "-")}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-slide-up">
        {activeTab === "Profile" && <ProfileSettings />}
        {activeTab === "Integrations" && <IntegrationsSettings />}
        {activeTab === "Danger Zone" && <DangerZone />}
      </div>
    </div>
  );
}
