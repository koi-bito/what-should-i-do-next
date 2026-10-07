"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toast";

export function ReferralSettings() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (session?.user.id) {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://whatnext.com";
      setInviteLink(`${origin}/signup?ref=${session.user.id}`);
    }
  }, [session]);

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard.",
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Refer a Friend</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends to What Should I Do Next? and you'll both get 3 extra free queries!
        </p>
      </div>

      <div className="bg-surface rounded-xl p-6 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Your unique invite link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="input-primary flex-1 bg-background"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={copyLink}
            className="btn-primary py-2 px-4 whitespace-nowrap shadow-glow-primary"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
