"use client";

import Link from "next/link";
import type { Phase } from "@/lib/types";
import { formatDisplayDate } from "@/lib/calculations";

interface PhaseCardProps {
  phase: Phase;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PhaseCard({
  phase,
  onActivate,
  onDelete,
}: PhaseCardProps) {
  const tags = [
    phase.trackProtein && { label: "Protein", emoji: "🥩" },
  ].filter(Boolean) as { label: string; emoji: string }[];

  return (
    <div
      className="bg-surface rounded-xl border border-border p-4 flex gap-3"
      style={{ borderLeftColor: phase.color, borderLeftWidth: 3 }}
    >
      <div className="text-3xl shrink-0 pt-0.5">{phase.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-app-text text-base leading-tight">
            {phase.name}
          </h3>
          {phase.active && (
            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
              Active
            </span>
          )}
        </div>

        {phase.description && (
          <p className="text-secondary text-sm mb-2 line-clamp-2">
            {phase.description}
          </p>
        )}

        <p className="text-muted text-xs mb-2">
          {formatDisplayDate(phase.startDate.split("T")[0])} →{" "}
          {formatDisplayDate(phase.endDate.split("T")[0])} · {phase.duration}{" "}
          days
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className="text-xs px-2 py-0.5 rounded-full bg-border text-secondary"
              >
                {tag.emoji} {tag.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {!phase.active && (
            <button
              type="button"
              onClick={() => onActivate(phase.id)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors"
            >
              Set Active
            </button>
          )}
          <Link
            href={`/phases/${phase.id}`}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-border text-secondary hover:text-app-text hover:bg-border/80 transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(phase.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
