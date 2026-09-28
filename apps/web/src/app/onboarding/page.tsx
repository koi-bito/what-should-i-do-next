"use client";

import { useState } from "react";
import { GoalsStep } from "@/components/onboarding/goals-step";
import { WorkingHoursStep } from "@/components/onboarding/working-hours-step";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";

const STEPS = ["Goals", "Working Hours", "Done"] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const progress = ((step + 1) / STEPS.length) * 100;

  async function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // Mark onboarding as complete
      try {
        await apiClient.patch("/users/me", {
          onboardedAt: new Date().toISOString(),
        });
      } catch {
        // Non-blocking — continue to app even if this fails
      }
      router.push("/app");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold mx-auto mb-4">W</div>
          <h1 className="text-xl font-semibold text-foreground">Set up WhatNext?</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="card p-8 shadow-card-primary animate-fade-slide-up">
          {step === 0 && <GoalsStep onComplete={next} />}
          {step === 1 && <WorkingHoursStep onComplete={next} />}
          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-bold text-foreground">You're all set!</h2>
              <p className="text-sm text-muted-foreground">
                Ask your first "what should I do next?" to get started.
              </p>
              <button id="go-to-app-btn" onClick={next} className="btn-primary w-full py-3 text-base shadow-glow-primary">
                Let's go →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
