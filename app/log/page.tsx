"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import { todayStr } from "@/lib/calculations";
import type { DailyLog, Profile } from "@/lib/types";
import ProteinTracker, { ProteinCounts } from "@/components/ProteinTracker";
import ProgressBar from "@/components/ProgressBar";

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6 flex flex-col gap-4">
          <div className="h-8 bg-surface rounded-lg animate-pulse w-48" />
          <div className="h-24 bg-surface rounded-xl animate-pulse" />
          <div className="h-48 bg-surface rounded-xl animate-pulse" />
        </div>
      }
    >
      <LogContent />
    </Suspense>
  );
}

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const dateParam = searchParams.get("date") ?? todayStr();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [existingLog, setExistingLog] = useState<DailyLog | null>(null);

  // Form state
  const [proteinCounts, setProteinCounts] = useState<ProteinCounts>({});
  const [fiberGrams, setFiberGrams] = useState("");
  const [priority, setPriority] = useState<boolean | null>(null);
  const [note, setNote] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, logRes] = await Promise.all([
        fetch("/api/profile"),
        fetch(`/api/logs/${dateParam}`),
      ]);

      const profileData: Profile = await profileRes.json();
      const log: DailyLog | null = await logRes.json();

      setProfile(profileData);

      if (log) {
        setExistingLog(log);
        setPriority(log.proteinPriority ?? null);
        setFiberGrams(log.fiberGrams != null ? String(log.fiberGrams) : "");
        setNote(log.note ?? "");

        const counts: ProteinCounts = {};
        (log.proteinEntries ?? []).forEach((e) => {
          counts[e.sourceKey] = e.quantity;
        });
        setProteinCounts(counts);
      }
    } finally {
      setLoading(false);
    }
  }, [dateParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave() {
    setSaving(true);
    try {
      const proteinEntries = Object.entries(proteinCounts)
        .filter(([, qty]) => qty > 0)
        .map(([sourceKey, quantity]) => ({ sourceKey, quantity }));

      const payload = {
        date: dateParam,
        phaseId: null,
        proteinPriority: priority,
        fiberGrams: fiberGrams || null,
        note: note || null,
        proteinEntries,
        questionAnswers: [],
      };

      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      showToast(existingLog ? "Log updated!" : "Log saved!", "success");
      router.push("/history");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/logs/${dateParam}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Log deleted", "info");
      router.push("/history");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  }

  const isToday = dateParam === todayStr();
  const displayDate = isToday
    ? "Today"
    : new Date(dateParam + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

  const fiberGoal = profile?.fiberGoal ?? 25;
  const fiberValue = parseFloat(fiberGrams) || 0;

  if (loading) {
    return (
      <div className="py-8 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-48" />
        <div className="h-24 bg-surface rounded-xl animate-pulse" />
        <div className="h-48 bg-surface rounded-xl animate-pulse" />
        <div className="h-16 bg-surface rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-secondary hover:text-app-text text-xl"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
            {existingLog ? "Edit Log" : "Log Your Day"}
          </h1>
          <p className="text-secondary text-sm mt-0.5">{displayDate}</p>
        </div>
      </div>

      {/* Section: Protein */}
      <section className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          🥩 Protein Intake
        </label>
        <ProteinTracker
          counts={proteinCounts}
          onChange={setProteinCounts}
          goal={profile?.proteinGoal ?? 120}
        />
      </section>

      {/* Section: Fiber */}
      <section className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          🌿 Fiber Intake
        </label>
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="200"
              step="1"
              value={fiberGrams}
              onChange={(e) => setFiberGrams(e.target.value)}
              placeholder="0"
              className="w-24 bg-bg border border-border rounded-lg px-3 py-2 text-app-text text-lg font-bold text-center focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-secondary text-sm">
              g &nbsp;/&nbsp; <span className="text-app-text font-semibold">{fiberGoal}g</span> goal
            </span>
          </div>
          <ProgressBar
            value={fiberValue}
            max={fiberGoal}
            color="var(--color-success)"
          />
        </div>
      </section>

      {/* Section: Priority */}
      <section className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Did I make protein a priority today?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPriority(priority === true ? null : true)}
            className={`flex-1 py-3 rounded-xl border font-bold text-base transition-all ${
              priority === true
                ? "bg-accent/10 border-accent text-accent"
                : "bg-surface border-border text-secondary hover:border-accent/40"
            }`}
          >
            👍 Yes
          </button>
          <button
            type="button"
            onClick={() => setPriority(priority === false ? null : false)}
            className={`flex-1 py-3 rounded-xl border font-bold text-base transition-all ${
              priority === false
                ? "bg-danger/10 border-danger text-danger"
                : "bg-surface border-border text-secondary hover:border-danger/40"
            }`}
          >
            👎 Not really
          </button>
        </div>
      </section>

      {/* Section: Notes */}
      <section className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Notes & Observations
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did your body feel? Any observations..."
          rows={3}
          className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-muted"
        />
      </section>

      {/* Save */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-xl bg-accent text-bg font-extrabold text-base hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : existingLog ? "Update Log" : "Save Log"}
      </button>

      {/* Delete — only show when editing existing log */}
      {existingLog && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${
            deleteConfirm
              ? "bg-danger text-white"
              : "border border-danger/50 text-danger hover:bg-danger/10"
          }`}
        >
          {deleting ? "Deleting..." : deleteConfirm ? "Tap again to confirm delete" : "Delete This Log"}
        </button>
      )}
    </div>
  );
}
