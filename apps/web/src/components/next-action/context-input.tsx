"use client";

import { useState } from "react";
import type { ContextPayload } from "@/types/api";

interface ContextInputProps {
  onSubmit: (context: ContextPayload) => void;
  isSubmitting: boolean;
}

const ENERGY_OPTIONS = [
  { value: 1, label: "😴", desc: "Exhausted" },
  { value: 2, label: "😪", desc: "Low" },
  { value: 3, label: "😐", desc: "Okay" },
  { value: 4, label: "😊", desc: "Good" },
  { value: 5, label: "🚀", desc: "On fire" },
];

const TIME_OPTIONS = [
  { value: 10, label: "10m" },
  { value: 15, label: "15m" },
  { value: 30, label: "30m" },
  { value: 60, label: "1h" },
  { value: 90, label: "1.5h" },
  { value: 120, label: "2h+" },
];

export function ContextInput({ onSubmit, isSubmitting }: ContextInputProps) {
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [minutesAvailable, setMinutesAvailable] = useState<number>(30);
  const [mood, setMood] = useState<string>("");

  function handleEnergyKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (index + 1) % ENERGY_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (index - 1 + ENERGY_OPTIONS.length) % ENERGY_OPTIONS.length;
    } else {
      return;
    }
    e.preventDefault();
    const nextValue = ENERGY_OPTIONS[nextIndex].value;
    setEnergyLevel(nextValue);
    document.getElementById(`energy-${nextValue}`)?.focus();
  }

  function handleTimeKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (index + 1) % TIME_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (index - 1 + TIME_OPTIONS.length) % TIME_OPTIONS.length;
    } else {
      return;
    }
    e.preventDefault();
    const nextValue = TIME_OPTIONS[nextIndex].value;
    setMinutesAvailable(nextValue);
    document.getElementById(`time-${nextValue}`)?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      energyLevel: energyLevel as 1 | 2 | 3 | 4 | 5,
      minutesAvailable,
      mood: mood || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 animate-fade-slide-up" id="context-input-form" aria-label="Context input form">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          What should you do next?
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell us where you&apos;re at — we&apos;ll find the one right thing to do.
        </p>
      </div>

      {/* Energy Level */}
      <fieldset>
        <legend className="block text-sm font-medium text-foreground mb-3">
          How&apos;s your energy right now?
        </legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Energy level">
          {ENERGY_OPTIONS.map((opt, index) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={energyLevel === opt.value}
              aria-label={`${opt.desc} (${opt.value} out of 5)`}
              tabIndex={energyLevel === opt.value ? 0 : -1}
              id={`energy-${opt.value}`}
              onClick={() => setEnergyLevel(opt.value)}
              onKeyDown={(e) => handleEnergyKeyDown(e, index)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition-all duration-150 ${
                energyLevel === opt.value
                  ? "border-primary bg-primary/10 text-foreground scale-105"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:bg-surface-hover"
              }`}
            >
              <span className="text-xl" aria-hidden="true">{opt.label}</span>
              <span className="text-xs hidden sm:block">{opt.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Time Available */}
      <fieldset>
        <legend className="block text-sm font-medium text-foreground mb-3">
          How much time do you have?
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Available time">
          {TIME_OPTIONS.map((opt, index) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={minutesAvailable === opt.value}
              aria-label={`${opt.label} available`}
              tabIndex={minutesAvailable === opt.value ? 0 : -1}
              id={`time-${opt.value}`}
              onClick={() => setMinutesAvailable(opt.value)}
              onKeyDown={(e) => handleTimeKeyDown(e, index)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                minutesAvailable === opt.value
                  ? "border-primary bg-primary/10 text-primary scale-105"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:bg-surface-hover"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Mood (optional) */}
      <div>
        <label htmlFor="mood-input" className="block text-sm font-medium text-foreground mb-3">
          Anything else on your mind? <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="mood-input"
          type="text"
          placeholder="e.g. feeling scattered, need a win, avoiding emails..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          maxLength={120}
          className="input-base"
          aria-describedby="mood-hint"
        />
        <p id="mood-hint" className="sr-only">Optional free-text field to describe your current mood or context</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="get-next-action-btn"
        disabled={isSubmitting}
        className="btn-primary w-full py-3.5 text-base shadow-glow-primary"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Finding your next action...
          </span>
        ) : (
          "What should I do next? →"
        )}
      </button>
    </form>
  );
}
