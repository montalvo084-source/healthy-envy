"use client";

import type { Checkpoint, Profile } from "@/lib/types";
import { formatDisplayDate } from "@/lib/calculations";

interface CheckpointTableProps {
  checkpoints: Checkpoint[];
  profile: Profile;
}

function delta(current: number | null, baseline: number | null): string | null {
  if (current == null || baseline == null) return null;
  const diff = current - baseline;
  if (diff === 0) return "—";
  return diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
}

function deltaColor(current: number | null, baseline: number | null): string {
  if (current == null || baseline == null) return "text-secondary";
  const diff = current - baseline;
  if (diff < 0) return "text-success";
  if (diff > 0) return "text-danger";
  return "text-secondary";
}

export default function CheckpointTable({
  checkpoints,
  profile,
}: CheckpointTableProps) {
  const hasBaseline =
    profile.startWaist ||
    profile.startHips ||
    profile.startChest;

  const cols = ["Date", "Waist", "Hips", "Chest"];

  const baseline = hasBaseline
    ? {
        date: "Baseline",
        waist: profile.startWaist,
        hips: profile.startHips,
        chest: profile.startChest,
        note: null,
        isBaseline: true,
      }
    : null;

  if (!baseline && checkpoints.length === 0) {
    return (
      <p className="text-secondary text-sm text-center py-4">
        No measurements recorded yet
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col}
                className="text-left text-xs font-semibold uppercase tracking-wide text-secondary pb-2 pr-3 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baseline && (
            <tr className="border-t border-border">
              <td className="py-2 pr-3 text-accent font-semibold whitespace-nowrap">
                Baseline
              </td>
              <td className="py-2 pr-3 text-app-text">{baseline.waist ?? "—"}</td>
              <td className="py-2 pr-3 text-app-text">{baseline.hips ?? "—"}</td>
              <td className="py-2 pr-3 text-app-text">{baseline.chest ?? "—"}</td>
            </tr>
          )}
          {checkpoints.map((cp) => (
            <tr key={cp.id} className="border-t border-border">
              <td className="py-2 pr-3 text-app-text whitespace-nowrap">
                {formatDisplayDate(cp.date)}
              </td>
              <td className="py-2 pr-3">
                {cp.waist != null ? (
                  <>
                    <span className="text-app-text">{cp.waist}"</span>
                    {baseline && (
                      <span className={`text-xs ml-1 ${deltaColor(cp.waist, baseline.waist)}`}>
                        {delta(cp.waist, baseline.waist)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="py-2 pr-3">
                {cp.hips != null ? (
                  <>
                    <span className="text-app-text">{cp.hips}"</span>
                    {baseline && (
                      <span className={`text-xs ml-1 ${deltaColor(cp.hips, baseline.hips)}`}>
                        {delta(cp.hips, baseline.hips)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="py-2 pr-3">
                {cp.chest != null ? (
                  <>
                    <span className="text-app-text">{cp.chest}"</span>
                    {baseline && (
                      <span className={`text-xs ml-1 ${deltaColor(cp.chest, baseline.chest)}`}>
                        {delta(cp.chest, baseline.chest)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
