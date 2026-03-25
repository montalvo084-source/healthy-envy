"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetInput, setResetInput] = useState("");

  // Stats
  const [logCount, setLogCount] = useState(0);
  const [phaseCount, setPhaseCount] = useState(0);
  const [checkpointCount, setCheckpointCount] = useState(0);

  // Profile form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [startWeight, setStartWeight] = useState("");
  const [startWaist, setStartWaist] = useState("");
  const [startChest, setStartChest] = useState("");
  const [startArms, setStartArms] = useState("");

  useEffect(() => {
    async function load() {
      const [profileRes, logsRes, phasesRes, cpRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/logs"),
        fetch("/api/phases"),
        fetch("/api/checkpoints"),
      ]);
      const profile: Profile = await profileRes.json();
      const logs = await logsRes.json();
      const phases = await phasesRes.json();
      const cps = await cpRes.json();

      setName(profile.name);
      setAge(String(profile.age));
      setProteinGoal(String(profile.proteinGoal));
      setUnit(profile.unit);
      setStartWeight(profile.startWeight != null ? String(profile.startWeight) : "");
      setStartWaist(profile.startWaist != null ? String(profile.startWaist) : "");
      setStartChest(profile.startChest != null ? String(profile.startChest) : "");
      setStartArms(profile.startArms != null ? String(profile.startArms) : "");

      setLogCount(logs.length);
      setPhaseCount(phases.length);
      setCheckpointCount(cps.length);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age,
          proteinGoal,
          unit,
          startWeight,
          startWaist,
          startChest,
          startArms,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Profile saved!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (resetInput !== "RESET") {
      showToast("Type RESET to confirm", "error");
      return;
    }
    await fetch("/api/reset", { method: "DELETE" });
    showToast("All data reset", "info");
    setResetStep(0);
    setResetInput("");
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-28" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
        Settings
      </h1>

      {/* Profile section */}
      <section className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-app-text uppercase tracking-wide">
          Profile & Goals
        </h2>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-24">
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Daily Protein Goal (g)
            </label>
            <input
              type="number"
              value={proteinGoal}
              onChange={(e) => setProteinGoal(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-28">
            <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-3">
            Starting Measurements (baseline)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Weight", value: startWeight, set: setStartWeight },
              { label: "Waist", value: startWaist, set: setStartWaist },
              { label: "Chest", value: startChest, set: setStartChest },
              { label: "Arms", value: startArms, set: setStartArms },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {label}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder="—"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-accent text-bg font-extrabold text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </section>

      {/* Data Summary */}
      <section className="bg-surface rounded-xl border border-border p-4">
        <h2 className="text-sm font-bold text-app-text uppercase tracking-wide mb-3">
          Data Summary
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-extrabold text-app-text">{logCount}</p>
            <p className="text-xs text-secondary mt-0.5">Daily Logs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-app-text">{phaseCount}</p>
            <p className="text-xs text-secondary mt-0.5">Phases</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-app-text">{checkpointCount}</p>
            <p className="text-xs text-secondary mt-0.5">Checkpoints</p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-surface rounded-xl border border-danger/30 p-4 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-danger uppercase tracking-wide">
          Danger Zone
        </h2>

        {resetStep === 0 && (
          <button
            type="button"
            onClick={() => setResetStep(1)}
            className="w-full py-3 rounded-xl border border-danger/50 text-danger font-bold text-sm hover:bg-danger/10 transition-colors"
          >
            Reset All Data
          </button>
        )}

        {resetStep === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              This will delete all logs, phases, and checkpoints. This cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResetStep(0)}
                className="flex-1 py-2 rounded-lg border border-border text-secondary font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setResetStep(2)}
                className="flex-1 py-2 rounded-lg bg-danger/10 border border-danger/50 text-danger font-bold text-sm"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {resetStep === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-secondary">
              Type <span className="text-danger font-bold">RESET</span> to
              permanently delete everything.
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="Type RESET here"
              className="w-full bg-bg border border-danger/50 rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-danger transition-colors"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetStep(0);
                  setResetInput("");
                }}
                className="flex-1 py-2 rounded-lg border border-border text-secondary font-bold text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetInput !== "RESET"}
                className="flex-1 py-2 rounded-lg bg-danger text-white font-bold text-sm disabled:opacity-40 hover:bg-danger/80 transition-colors"
              >
                Delete Everything
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
