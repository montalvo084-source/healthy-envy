"use client";

import { useEffect, useState } from "react";
import type { Phase, DailyLog, Checkpoint, Profile } from "@/lib/types";
import ChartProtein from "@/components/ChartProtein";
import ChartFiber from "@/components/ChartFiber";
import CheckpointTable from "@/components/CheckpointTable";

export default function ProgressPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, phasesRes, logsRes, cpRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/phases"),
        fetch("/api/logs"),
        fetch("/api/checkpoints"),
      ]);
      setProfile(await profileRes.json());
      setPhases(await phasesRes.json());
      setLogs(await logsRes.json());
      setCheckpoints(await cpRes.json());
      setLoading(false);
    }
    load();
  }, []);

  const filteredLogs =
    selectedPhaseId === null
      ? logs
      : logs.filter((l) => l.phaseId === selectedPhaseId);

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-36" />
        <div className="h-10 bg-surface rounded-xl animate-pulse" />
        <div className="h-48 bg-surface rounded-xl animate-pulse" />
        <div className="h-48 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
        Progress
      </h1>

      {/* Phase Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          type="button"
          onClick={() => setSelectedPhaseId(null)}
          className={`shrink-0 text-xs font-bold px-3 py-2 rounded-lg border transition-colors ${
            selectedPhaseId === null
              ? "bg-accent/10 border-accent text-accent"
              : "bg-surface border-border text-secondary hover:border-accent/40"
          }`}
        >
          All
        </button>
        {phases.map((phase) => (
          <button
            key={phase.id}
            type="button"
            onClick={() =>
              setSelectedPhaseId(
                selectedPhaseId === phase.id ? null : phase.id
              )
            }
            className={`shrink-0 text-xs font-bold px-3 py-2 rounded-lg border transition-colors`}
            style={
              selectedPhaseId === phase.id
                ? {
                    backgroundColor: `${phase.color}20`,
                    borderColor: phase.color,
                    color: phase.color,
                  }
                : {
                    backgroundColor: "transparent",
                    borderColor: "#252540",
                    color: "#888",
                  }
            }
          >
            {phase.icon} {phase.name}
          </button>
        ))}
      </div>

      {/* Protein Chart */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <h2 className="text-sm font-bold text-app-text uppercase tracking-wide mb-3">
          Protein Intake
        </h2>
        <ChartProtein
          logs={filteredLogs}
          goal={profile?.proteinGoal ?? 120}
          days={60}
        />
      </div>

      {/* Fiber Chart */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <h2 className="text-sm font-bold text-app-text uppercase tracking-wide mb-3">
          Fiber Intake
        </h2>
        <ChartFiber
          logs={filteredLogs}
          goal={profile?.fiberGoal ?? 25}
          days={60}
        />
      </div>

      {/* Measurement Checkpoints */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-app-text uppercase tracking-wide">
            Measurement Checkpoints
          </h2>
          <a
            href="/checkpoints"
            className="text-xs font-bold text-accent hover:text-accent/80 transition-colors"
          >
            + Add
          </a>
        </div>
        {profile && (
          <CheckpointTable checkpoints={checkpoints} profile={profile} />
        )}
      </div>
    </div>
  );
}
