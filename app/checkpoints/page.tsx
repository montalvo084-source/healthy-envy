"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { todayStr, formatDisplayDate } from "@/lib/calculations";
import type { Checkpoint } from "@/lib/types";

export default function CheckpointsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [note, setNote] = useState("");

  async function loadCheckpoints() {
    const res = await fetch("/api/checkpoints");
    setCheckpoints(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadCheckpoints();
  }, []);

  async function handleSave() {
    if (!weight && !waist && !chest && !arms) {
      showToast("Enter at least one measurement", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/checkpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr(),
          weight: weight || null,
          waist: waist || null,
          chest: chest || null,
          arms: arms || null,
          note: note || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Checkpoint saved!", "success");
      setWeight("");
      setWaist("");
      setChest("");
      setArms("");
      setNote("");
      loadCheckpoints();
      router.push("/progress");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    await fetch(`/api/checkpoints/${id}`, { method: "DELETE" });
    showToast("Checkpoint deleted", "info");
    setDeleteConfirmId(null);
    loadCheckpoints();
  }

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-48" />
        <div className="h-64 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
        Record Checkpoint
      </h1>
      <p className="text-secondary text-sm -mt-3">
        {formatDisplayDate(todayStr())} — all fields optional
      </p>

      {/* Form */}
      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Weight", value: weight, set: setWeight, unit: "lbs" },
            { label: "Waist", value: waist, set: setWaist, unit: "in" },
            { label: "Chest", value: chest, set: setChest, unit: "in" },
            { label: "Arms", value: arms, set: setArms, unit: "in" },
          ].map(({ label, value, set, unit }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {label} ({unit})
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder="—"
                className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Notes (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How are you feeling? Any observations..."
            rows={2}
            className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-accent text-bg font-extrabold text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Checkpoint"}
        </button>
      </div>

      {/* Past checkpoints */}
      {checkpoints.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Past Checkpoints
          </h2>
          {[...checkpoints].reverse().map((cp) => (
            <div
              key={cp.id}
              className="bg-surface rounded-xl border border-border p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-bold text-app-text text-sm">
                  {formatDisplayDate(cp.date)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(cp.id)}
                  className={`text-xs font-bold transition-colors ${
                    deleteConfirmId === cp.id
                      ? "text-danger"
                      : "text-muted hover:text-danger"
                  }`}
                >
                  {deleteConfirmId === cp.id ? "Confirm delete?" : "Delete"}
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {cp.weight && (
                  <span className="text-secondary">
                    ⚖️ <span className="text-app-text font-semibold">{cp.weight}</span>
                  </span>
                )}
                {cp.waist && (
                  <span className="text-secondary">
                    📏 Waist{" "}
                    <span className="text-app-text font-semibold">{cp.waist}</span>
                  </span>
                )}
                {cp.chest && (
                  <span className="text-secondary">
                    Chest{" "}
                    <span className="text-app-text font-semibold">{cp.chest}</span>
                  </span>
                )}
                {cp.arms && (
                  <span className="text-secondary">
                    Arms{" "}
                    <span className="text-app-text font-semibold">{cp.arms}</span>
                  </span>
                )}
              </div>
              {cp.note && (
                <p className="text-secondary text-xs mt-2 italic">{cp.note}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
