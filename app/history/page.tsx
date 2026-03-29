"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyLog } from "@/lib/types";
import LogCard from "@/components/LogCard";
import { todayStr } from "@/lib/calculations";
import { useProteinSources } from "@/lib/protein-sources-context";
import { useToast } from "@/lib/toast-context";

export default function HistoryPage() {
  const { sources } = useProteinSources();
  const { showToast } = useToast();
  const router = useRouter();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [jumpDate, setJumpDate] = useState("");

  function loadLogs() {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data: DailyLog[]) => {
        setLogs(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function handleJump() {
    const date = jumpDate || todayStr();
    router.push(`/log?date=${date}`);
  }

  async function handleDelete(log: DailyLog) {
    if (deleteConfirmId !== log.id) {
      setDeleteConfirmId(log.id);
      return;
    }
    await fetch(`/api/logs/${log.date}`, { method: "DELETE" });
    showToast("Log deleted", "info");
    setDeleteConfirmId(null);
    loadLogs();
  }

  if (loading) {
    return (
      <div className="py-6 flex flex-col gap-4">
        <div className="h-8 bg-surface rounded-lg animate-pulse w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-app-text tracking-tight">
          Log History
        </h1>
        <span className="text-xs text-secondary font-semibold">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Log a specific date */}
      <div className="bg-surface rounded-xl border border-border p-3 flex gap-2">
        <input
          type="date"
          value={jumpDate}
          onChange={(e) => setJumpDate(e.target.value)}
          className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-app-text text-sm focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={handleJump}
          className="px-4 py-2 rounded-lg bg-accent text-bg font-bold text-sm hover:bg-accent/80 transition-colors"
        >
          {jumpDate ? "Go" : "Log Today"}
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-bold text-app-text text-lg">No logs yet</p>
          <p className="text-secondary text-sm mt-1">
            Start your journey — log your first day
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              <LogCard log={log} isToday={log.date === todayStr()} sources={sources} />
              {/* Delete button overlay */}
              <button
                type="button"
                onClick={() => handleDelete(log)}
                className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                  deleteConfirmId === log.id
                    ? "bg-danger text-white"
                    : "text-muted hover:text-danger bg-bg border border-border"
                }`}
              >
                {deleteConfirmId === log.id ? "Confirm?" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
