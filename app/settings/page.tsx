"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/lib/toast-context";
import { useProteinSources } from "@/lib/protein-sources-context";
import type { Profile, ProteinSource } from "@/lib/types";

export default function SettingsPage() {
  const { showToast } = useToast();
  const { sources, reload: reloadSources } = useProteinSources();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetInput, setResetInput] = useState("");

  // Protein sources editing state
  const [editingSource, setEditingSource] = useState<ProteinSource | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [savingSource, setSavingSource] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New source form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [newUnit, setNewUnit] = useState("g");
  const [newEmoji, setNewEmoji] = useState("🥩");
  const [addingSource, setAddingSource] = useState(false);

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

  function startEdit(source: ProteinSource) {
    setEditingSource(source);
    setEditLabel(source.label);
    setEditProtein(String(source.protein));
    setEditUnit(source.unit);
    setEditEmoji(source.emoji);
  }

  async function handleSaveSource() {
    if (!editingSource) return;
    setSavingSource(true);
    try {
      const res = await fetch(`/api/protein-sources/${editingSource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel,
          protein: editProtein,
          unit: editUnit,
          emoji: editEmoji,
          active: editingSource.active,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await reloadSources();
      setEditingSource(null);
      showToast("Source updated!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSavingSource(false);
    }
  }

  async function handleToggleActive(source: ProteinSource) {
    await fetch(`/api/protein-sources/${source.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: source.label,
        protein: source.protein,
        unit: source.unit,
        emoji: source.emoji,
        active: !source.active,
      }),
    });
    await reloadSources();
  }

  async function handleDeleteSource(id: number) {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    await fetch(`/api/protein-sources/${id}`, { method: "DELETE" });
    await reloadSources();
    setDeletingId(null);
    showToast("Source deleted", "info");
  }

  async function handleAddSource() {
    if (!newLabel || !newProtein) {
      showToast("Name and protein amount are required", "error");
      return;
    }
    setAddingSource(true);
    try {
      const key = newLabel.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") + "_" + Date.now();
      const res = await fetch("/api/protein-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          label: newLabel,
          protein: newProtein,
          unit: newUnit,
          emoji: newEmoji,
          active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await reloadSources();
      setNewLabel("");
      setNewProtein("");
      setNewUnit("g");
      setNewEmoji("🥩");
      setShowAddForm(false);
      showToast("Source added!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setAddingSource(false);
    }
  }

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

      {/* Protein Sources */}
      <section className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-app-text uppercase tracking-wide">
            Protein Sources
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs font-bold text-accent hover:text-accent/80 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showAddForm && (
          <div className="flex flex-col gap-3 border border-border rounded-xl p-3 bg-bg">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">New Source</p>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 w-14">
                <label className="text-xs text-secondary">Emoji</label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:border-accent"
                  maxLength={4}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-secondary">Name</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Beef"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-secondary">Protein (g) per unit</label>
                <input
                  type="number"
                  value={newProtein}
                  onChange={(e) => setNewProtein(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-secondary">Unit label</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="g"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddSource}
              disabled={addingSource}
              className="w-full py-2.5 rounded-xl bg-accent text-bg font-extrabold text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {addingSource ? "Adding..." : "Add Source"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {sources.map((source) => (
            <div key={source.id}>
              {editingSource?.id === source.id ? (
                <div className="flex flex-col gap-2 border border-accent/40 rounded-xl p-3 bg-bg">
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 w-14">
                      <label className="text-xs text-secondary">Emoji</label>
                      <input
                        type="text"
                        value={editEmoji}
                        onChange={(e) => setEditEmoji(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:border-accent"
                        maxLength={4}
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-secondary">Name</label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-secondary">Protein (g) per unit</label>
                      <input
                        type="number"
                        value={editProtein}
                        onChange={(e) => setEditProtein(e.target.value)}
                        min="0"
                        step="0.1"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-secondary">Unit label</label>
                      <input
                        type="text"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSource(null)}
                      className="flex-1 py-2 rounded-lg border border-border text-secondary font-bold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSource}
                      disabled={savingSource}
                      className="flex-1 py-2 rounded-lg bg-accent text-bg font-bold text-sm disabled:opacity-50"
                    >
                      {savingSource ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${source.active ? "border-border bg-bg" : "border-border/50 bg-bg opacity-50"}`}>
                  <span className="text-xl w-7 text-center">{source.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-app-text truncate">{source.label}</p>
                    <p className="text-xs text-secondary">{source.protein}g per {source.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(source)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${source.active ? "text-success bg-success/10" : "text-secondary bg-border"}`}
                    >
                      {source.active ? "On" : "Off"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(source)}
                      className="text-xs px-2 py-1 rounded-lg text-secondary hover:text-app-text bg-border transition-colors font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSource(source.id)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${deletingId === source.id ? "bg-danger text-white" : "text-danger/70 bg-danger/10"}`}
                    >
                      {deletingId === source.id ? "Sure?" : "Del"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
