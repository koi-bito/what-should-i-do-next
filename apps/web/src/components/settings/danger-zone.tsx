"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";

export function DangerZone() {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (confirmText !== "delete my account") return;
    setIsDeleting(true);
    try {
      await apiClient.delete("/users/me");
      await supabaseBrowserClient.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      alert(`Failed to delete account: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card border-destructive/20 p-6">
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
        />
        <button
          id="delete-account-btn"
          onClick={handleDeleteAccount}
          disabled={confirmText !== "delete my account" || isDeleting}
          className="btn-destructive w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete my account permanently"}
        </button>
      </div>
    </div>
  );
}
