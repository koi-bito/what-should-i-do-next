"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { useToast } from "@/components/ui/toast";

export function DangerZone() {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { error } = useToast();

  async function handleDeleteAccount() {
    if (confirmText !== "delete my account") return;
    setIsDeleting(true);
    try {
      await apiClient.delete("/users/me");
      await supabaseBrowserClient.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      error(`Failed to delete account: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card border-destructive/20 p-6" role="region" aria-label="Danger zone - account deletion">
      <h3 className="text-base font-semibold text-destructive mb-2">Delete account</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Permanently delete your account and all associated data — goals, tasks, query history, integrations.
        This action is immediate and irreversible.
      </p>

      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Type <strong className="text-foreground font-mono text-xs">delete my account</strong> to confirm.
        </p>
        <input
          id="delete-confirm-input"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="input-base"
          placeholder="delete my account"
          aria-label="Type 'delete my account' to confirm deletion"
        />
        <button
          id="delete-account-btn"
          onClick={handleDeleteAccount}
          disabled={confirmText !== "delete my account" || isDeleting}
          className="btn-destructive w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Deleting...
            </span>
          ) : "Delete my account permanently"}
        </button>
      </div>
    </div>
  );
}
