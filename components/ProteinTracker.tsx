"use client";

import { useEffect, useRef, useState } from "react";
import { useProteinSources } from "@/lib/protein-sources-context";
import ProgressBar from "@/components/ProgressBar";

export interface ProteinCounts {
  [key: string]: number;
}

interface ProteinTrackerProps {
  counts: ProteinCounts;
  onChange: (counts: ProteinCounts) => void;
  goal: number;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  25: "25% There!",
  50: "Halfway There!",
  75: "75% Done!",
  100: "Goal Achieved! 🎉",
};

export default function ProteinTracker({
  counts,
  onChange,
  goal,
}: ProteinTrackerProps) {
  const { sources: allSources } = useProteinSources();
  const sources = allSources.filter((s) => s.active);

  const total = sources.reduce((sum, source) => {
    return sum + (counts[source.key] ?? 0) * source.protein;
  }, 0);

  const remaining = Math.max(0, goal - Math.round(total));
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const done = remaining === 0;

  const [milestone, setMilestone] = useState<string | null>(null);
  const prevPct = useRef(pct);

  useEffect(() => {
    const prev = prevPct.current;
    prevPct.current = pct;
    for (const m of [25, 50, 75, 100]) {
      if (prev < m && pct >= m) {
        setMilestone(MILESTONE_MESSAGES[m]);
        const t = setTimeout(() => setMilestone(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [pct]);

  function adjust(key: string, delta: number) {
    const current = counts[key] ?? 0;
    const next = Math.max(0, current + delta);
    onChange({ ...counts, [key]: next });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          🥩 Daily Protein
        </span>
        {done ? (
          <p className="text-4xl font-extrabold text-success">Goal Reached! 🎉</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-accent">{remaining}g</span>
            <span className="text-secondary text-base font-semibold">LEFT</span>
          </div>
        )}
        <ProgressBar value={total} max={goal} />
        <p className="text-xs text-secondary text-right">
          {Math.round(total)}g / {goal}g
          <span className="ml-2 text-app-text font-semibold">
            {done ? "Goal Reached!" : `${pct}% Complete`}
          </span>
        </p>
        {milestone && (
          <div className="mt-1 rounded-lg bg-accent/15 border border-accent/30 px-3 py-1.5 text-sm font-bold text-accent text-center">
            {milestone}
          </div>
        )}
      </div>

      {sources.map((source) => {
        const qty = counts[source.key] ?? 0;
        const grams = qty * source.protein;
        return (
          <div
            key={source.key}
            className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border"
          >
            <span className="text-2xl w-8 text-center">{source.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-app-text truncate">
                {source.label}
              </p>
              <p className="text-xs text-secondary">
                {grams > 0 ? `${grams}g protein` : `${source.protein}g per ${source.unit}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => adjust(source.key, -1)}
                disabled={qty === 0}
                className="w-9 h-9 rounded-lg bg-border text-app-text font-bold disabled:opacity-30 hover:bg-accent/20 transition-colors text-lg leading-none flex items-center justify-center"
                aria-label={`Decrease ${source.label}`}
              >
                −
              </button>
              <span className="w-8 text-center text-base font-bold text-app-text">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => adjust(source.key, 1)}
                className="w-9 h-9 rounded-lg bg-accent text-bg font-bold hover:bg-accent/80 transition-colors text-lg leading-none flex items-center justify-center"
                aria-label={`Increase ${source.label}`}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
