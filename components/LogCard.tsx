"use client";

import Link from "next/link";
import type { DailyLog } from "@/lib/types";
import { calcProteinTotal, formatDisplayDate } from "@/lib/calculations";

interface LogCardProps {
  log: DailyLog;
}

export default function LogCard({ log }: LogCardProps) {
  const protein = calcProteinTotal(log.proteinEntries ?? []);

  return (
    <Link
      href={`/log?date=${log.date}`}
      className="block bg-surface rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-bold text-app-text">{formatDisplayDate(log.date)}</p>
          {log.phase && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{
                backgroundColor: `${log.phase.color}20`,
                color: log.phase.color,
                borderColor: `${log.phase.color}40`,
                borderWidth: 1,
              }}
            >
              {log.phase.icon} {log.phase.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {protein > 0 && (
          <span className="text-secondary">
            🥩 <span className="text-app-text font-semibold">{Math.round(protein)}g</span>
          </span>
        )}
        {log.fiberGrams != null && log.fiberGrams > 0 && (
          <span className="text-secondary">
            🌿 <span className="text-app-text font-semibold">{log.fiberGrams}g</span> fiber
          </span>
        )}
        {log.proteinPriority !== null && (
          <span className="text-secondary">
            {log.proteinPriority ? "👍 Priority" : "👎 Not really"}
          </span>
        )}
      </div>

      {log.note && (
        <p className="text-secondary text-sm mt-2 line-clamp-2 italic">
          &ldquo;{log.note}&rdquo;
        </p>
      )}
    </Link>
  );
}
