/**
 * Keyboard shortcut helper for the dashboard.
 * 
 * Shortcuts:
 * - Enter: Submit context / Accept action
 * - Escape: Cancel reject flow
 * - r: Reject
 * - s: Snooze
 *
 * Only active when no input/textarea is focused.
 */
"use client";

import { useEffect } from "react";

interface KeyboardShortcutMap {
  [key: string]: (() => void) | undefined;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcutMap) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const fn = shortcuts[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
