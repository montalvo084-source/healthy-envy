"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Phase, DailyLog, Profile } from "@/lib/types";
import {
  calcStreak,
  calcAvgProtein,
  calcPhaseDay,
  calcProteinTotal,
  todayStr,
  formatDate,
} from "@/lib/calculations";
import { useProteinSources } from "@/lib/protein-sources-context";
import ProgressBar from "@/components/ProgressBar";
import ChartProtein from "@/components/ChartProtein";

export default function Dashboard() {
  const { sources } = useProteinSources();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, phasesRes, logsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/phases"),
        fetch("/api/logs"),
      ]);
      setProfile(await profileRes.json());
      setPhases(await phasesRes.json());
      setLogs(await logsRes.json());
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-48" />
        <div className="h-24 bg-surface rounded-xl animate-pulse" />
        <div className="h-20 bg-surface rounded-xl animate-pulse" />
        <div className="h-48 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  const activePhase = phases.find((p) => p.active) ?? null;
  const today = todayStr();
  const todayLog = logs.find((l) => l.date === today) ?? null;
  const todayLogged = todayLog !== null;
  const streak = calcStreak(logs);
  const avgProtein = calcAvgProtein(logs, 14, sources);
  const proteinGoal = profile?.proteinGoal ?? 120;

  // Weekly protein calc (Mon–Sun)
  const weekStart = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return formatDate(d);
  })();
  const weeklyLogs = logs.filter((l) => l.date >= weekStart);
  const weeklyProtein = Math.round(
    weeklyLogs.reduce((sum, l) => sum + calcProteinTotal(l.proteinEntries ?? [], sources), 0)
  );
  const weeklyGoal =
    (profile?.weeklyProteinGoal ?? 0) > 0
      ? profile!.weeklyProteinGoal
      : proteinGoal * 7;
  const weeklyRemaining = Math.max(0, weeklyGoal - weeklyProtein);
  const weeklyPct = Math.min(100, (weeklyProtein / weeklyGoal) * 100);

  const phaseDay = activePhase
    ? calcPhaseDay(activePhase.startDate.split("T")[0])
    : 0;
  const daysRemaining = activePhase
    ? Math.max(0, activePhase.duration - phaseDay + 1)
    : 0;

  return (
    <div className="py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
          🧪 Healthy Envy
        </h1>
        <Link
          href="/settings"
          className="text-secondary hover:text-app-text transition-colors text-lg"
          aria-label="Settings"
        >
          ⚙️
        </Link>
      </div>

      {/* Active Phase Banner */}
      {activePhase ? (
        <div
          className="bg-surface rounded-xl border border-border p-4"
          style={{ borderLeftColor: activePhase.color, borderLeftWidth: 3 }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{activePhase.icon}</span>
                <span className="font-bold text-app-text">{activePhase.name}</span>
              </div>
              <p className="text-secondary text-xs mt-0.5">
                Day {phaseDay} of {activePhase.duration} · {daysRemaining} days
                remaining
              </p>
            </div>
            <Link
              href={`/phases/${activePhase.id}`}
              className="text-xs font-bold text-secondary hover:text-accent transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-border"
            >
              Edit
            </Link>
          </div>
          <ProgressBar value={phaseDay} max={activePhase.duration} color={activePhase.color} />
        </div>
      ) : (
        <Link
          href="/phases"
          className="bg-surface rounded-xl border border-dashed border-border p-4 flex items-center justify-between text-secondary hover:border-accent/40 hover:text-accent transition-colors"
        >
          <span className="text-sm font-semibold">No active phase — set one up</span>
          <span>→</span>
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-extrabold text-accent">{streak}</p>
          <p className="text-xs text-secondary font-semibold uppercase tracking-wide mt-0.5">
            🔥 Streak
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-extrabold text-app-text">{logs.length}</p>
          <p className="text-xs text-secondary font-semibold uppercase tracking-wide mt-0.5">
            📝 Logs
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-2xl font-extrabold text-app-text">{avgProtein}g</p>
          <p className="text-xs text-secondary font-semibold uppercase tracking-wide mt-0.5">
            🥩 Avg
          </p>
        </div>
      </div>

      {/* Weekly Protein Widget */}
      <WeeklyProteinWidget
        logged={weeklyProtein}
        goal={weeklyGoal}
        remaining={weeklyRemaining}
        pct={weeklyPct}
      />

      {/* Log Today Button */}
      <Link
        href="/log"
        className={`w-full py-4 rounded-xl font-extrabold text-base text-center transition-colors ${
          todayLogged
            ? "bg-success/10 border border-success text-success"
            : "bg-accent text-bg hover:bg-accent/80"
        }`}
      >
        {todayLogged ? "✅ Update Today's Log" : "📝 Log Today"}
      </Link>

      {/* Today's Log Summary */}
      {todayLog && (
        <div className="flex gap-4 px-1">
          {calcProteinTotal(todayLog.proteinEntries ?? [], sources) > 0 && (
            <span className="text-sm text-secondary">
              🥩 <span className="text-app-text font-semibold">{Math.round(calcProteinTotal(todayLog.proteinEntries ?? [], sources))}g</span> protein
            </span>
          )}
          {todayLog.fiberGrams != null && todayLog.fiberGrams > 0 && (
            <span className="text-sm text-secondary">
              🌿 <span className="text-app-text font-semibold">{todayLog.fiberGrams}g</span> fiber
            </span>
          )}
        </div>
      )}

      {/* Mini Protein Chart */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-app-text uppercase tracking-wide">
            Protein · Last 14 Days
          </h2>
          <span className="text-xs text-secondary">Goal: {proteinGoal}g</span>
        </div>
        <ChartProtein logs={logs} goal={proteinGoal} days={14} sources={sources} />
      </div>

      {/* Record Measurement Button */}
      <Link
        href="/checkpoints"
        className="w-full py-3 rounded-xl bg-surface border border-border text-secondary font-semibold text-sm text-center hover:border-accent/40 hover:text-accent transition-colors"
      >
        📏 Record a Measurement Checkpoint
      </Link>
    </div>
  );
}

function WeeklyProteinWidget({
  logged,
  goal,
  remaining,
  pct,
}: {
  logged: number;
  goal: number;
  remaining: number;
  pct: number;
}) {
  const [barWidth, setBarWidth] = useState(0);
  const prevLogged = useRef(logged);

  useEffect(() => {
    // Animate on mount and whenever logged changes
    const t = setTimeout(() => setBarWidth(pct), 60);
    prevLogged.current = logged;
    return () => clearTimeout(t);
  }, [pct, logged]);

  const done = remaining === 0;

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-app-text uppercase tracking-wide">
          🥩 Protein This Week
        </h2>
        <Link
          href="/settings"
          className="text-xs text-secondary hover:text-accent transition-colors"
        >
          Set goal
        </Link>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <span className="text-3xl font-extrabold text-app-text">{logged}</span>
          <span className="text-secondary text-sm ml-1">g</span>
        </div>
        {done ? (
          <span className="text-success text-sm font-bold">Goal hit! 🎉</span>
        ) : (
          <span className="text-secondary text-sm">
            <span className="text-app-text font-bold">{remaining}g</span> left
          </span>
        )}
      </div>

      {/* Animated bar */}
      <div className="h-3 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${done ? "bg-success" : "bg-accent"}`}
          style={{ width: `${barWidth}%`, transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
      </div>

      <p className="text-xs text-muted text-right -mt-1">{logged}g / {goal}g</p>
    </div>
  );
}
