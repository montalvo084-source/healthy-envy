"use client";

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

  const pct = Math.round((total / goal) * 100);

  function adjust(key: string, delta: number) {
    const current = counts[key] ?? 0;
    const next = Math.max(0, current + delta);
    onChange({ ...counts, [key]: next });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface rounded-xl p-3 border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Daily Total
          </span>
          <span className="text-sm font-bold text-accent">
            {Math.round(total)}g
            <span className="text-secondary font-normal"> / {goal}g</span>
            <span className="text-secondary font-normal text-xs ml-1">
              ({pct}%)
            </span>
          </span>
        </div>
        <ProgressBar value={total} max={goal} />
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
