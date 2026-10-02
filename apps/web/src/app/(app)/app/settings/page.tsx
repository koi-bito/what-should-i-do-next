"use client";

import { useState } from "react";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { IntegrationsSettings } from "@/components/settings/integrations-settings";
import { DangerZone } from "@/components/settings/danger-zone";

const TABS = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "integrations", label: "Integrations", icon: "🔌" },
  { id: "danger", label: "Danger Zone", icon: "⚠️" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    else return;

    e.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    const btn = document.getElementById(`settings-tab-${TABS[nextIndex].id}`);
    btn?.focus();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, integrations, and account.</p>
      </div>

      {/* Tab list — ARIA tabs pattern */}
      <div
        className="flex gap-1 bg-surface rounded-xl p-1 border border-border w-fit"
        role="tablist"
        aria-label="Settings tabs"
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            id={`settings-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content panels */}
      {TABS.map((tab) => (
        <div
          key={tab.id}
          id={`settings-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className={activeTab === tab.id ? "animate-fade-slide-up" : ""}
        >
          {activeTab === tab.id && (
            <>
              {tab.id === "profile" && <ProfileSettings />}
              {tab.id === "integrations" && <IntegrationsSettings />}
              {tab.id === "danger" && <DangerZone />}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
