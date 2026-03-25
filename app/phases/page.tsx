"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Phase } from "@/lib/types";
import PhaseCard from "@/components/PhaseCard";
import { useToast } from "@/lib/toast-context";

export default function PhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { showToast } = useToast();

  async function loadPhases() {
    const res = await fetch("/api/phases");
    setPhases(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadPhases();
  }, []);

  async function handleActivate(id: number) {
    await fetch(`/api/phases/${id}/activate`, { method: "PUT" });
    showToast("Phase activated!", "success");
    loadPhases();
  }

  async function handleDelete(id: number) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    await fetch(`/api/phases/${id}`, { method: "DELETE" });
    showToast("Phase deleted", "info");
    setDeleteConfirmId(null);
    loadPhases();
  }

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
          Phases
        </h1>
        <Link
          href="/phases/new"
          className="text-sm font-bold px-3 py-2 rounded-xl bg-accent text-bg hover:bg-accent/80 transition-colors"
        >
          + New Phase
        </Link>
      </div>

      {deleteConfirmId !== null && (
        <div className="bg-danger/10 border border-danger/40 rounded-xl p-3 text-sm text-danger font-semibold">
          Tap Delete again to confirm. This keeps all associated logs.
          <button
            className="ml-2 underline text-secondary"
            onClick={() => setDeleteConfirmId(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {phases.length === 0 ? (
        <div className="text-center py-12 text-secondary">
          <p className="text-4xl mb-3">🧪</p>
          <p className="font-semibold">No phases yet</p>
          <p className="text-sm mt-1">Create your first experiment phase</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              onActivate={handleActivate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add another card */}
      <Link
        href="/phases/new"
        className="border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-secondary hover:border-accent/40 hover:text-accent transition-colors"
      >
        <span className="text-lg">+</span>
        <span className="text-sm font-semibold">Add another experiment phase</span>
      </Link>
    </div>
  );
}
