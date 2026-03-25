"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/lib/toast-context";
import type { Phase } from "@/lib/types";
import { todayStr } from "@/lib/calculations";

const PRESET_COLORS = [
  "#E8A838",
  "#38A89D",
  "#E85D75",
  "#7C6EE7",
  "#4A90D9",
  "#888888",
];

export default function PhaseEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const isNew = params.id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🧪");
  const [color, setColor] = useState("#E8A838");
  const [startDate, setStartDate] = useState(todayStr());
  const [duration, setDuration] = useState(14);
  const [trackProtein, setTrackProtein] = useState(true);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/phases/${params.id}`)
        .then((r) => r.json())
        .then((phase: Phase) => {
          setName(phase.name);
          setDescription(phase.description ?? "");
          setIcon(phase.icon);
          setColor(phase.color);
          setStartDate(phase.startDate.split("T")[0]);
          setDuration(phase.duration);
          setTrackProtein(phase.trackProtein);
          setLoading(false);
        });
    }
  }, [isNew, params.id]);

  const endDate = (() => {
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + duration - 1);
    return d.toISOString().split("T")[0];
  })();

  async function handleSave() {
    if (!name.trim()) {
      showToast("Phase name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        icon,
        color,
        startDate,
        duration,
        trackProtein,
      };

      const res = isNew
        ? await fetch("/api/phases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`/api/phases/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("Failed to save");

      showToast(isNew ? "Phase created!" : "Phase updated!", "success");
      router.push("/phases");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-40" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-secondary hover:text-app-text text-xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
          {isNew ? "New Phase" : "Edit Phase"}
        </h1>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Phase Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Increased Protein"
          className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you testing in this phase?"
          rows={2}
          className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      {/* Icon + Color Row */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 w-28">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Icon (emoji)
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => {
              const chars = [...e.target.value];
              setIcon(chars[chars.length - 1] ?? "🧪");
            }}
            placeholder="🧪"
            className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-center text-xl focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#fff" : "transparent",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
                aria-label={`Color ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg border border-border bg-bg cursor-pointer"
              title="Custom color"
            />
          </div>
        </div>
      </div>

      {/* Start Date + Duration */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5 w-28">
          <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Duration
          </label>
          <input
            type="number"
            min="1"
            max="90"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-bg border border-border rounded-lg px-3 py-3 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>
      <p className="text-xs text-secondary -mt-3">
        Ends: {endDate}
      </p>

      {/* Tracking Toggles */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Track In This Phase
        </label>
        <div className="flex gap-2">
          {[
            { key: "trackProtein", label: "🥩 Protein", value: trackProtein, set: setTrackProtein },
          ].map(({ key, label, value, set }) => (
            <button
              key={key}
              type="button"
              onClick={() => set(!value)}
              className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                value
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-surface border-border text-secondary hover:border-accent/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl border border-border text-secondary font-bold hover:border-app-text/30 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-accent text-bg font-extrabold hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isNew ? "Create Phase" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
