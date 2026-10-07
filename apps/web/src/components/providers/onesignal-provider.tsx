"use client";

import { useEffect } from "react";
import OneSignal from "react-onesignal";

export function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && typeof window !== "undefined") {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      }).catch((e) => {
        console.error("OneSignal init error", e);
      });
    }
  }, []);

  return <>{children}</>;
}
