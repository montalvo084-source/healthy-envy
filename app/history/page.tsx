"use client";

import { useEffect, useState } from "react";
import type { DailyLog } from "@/lib/types";
import LogCard from "@/components/LogCard";

export default function HistoryPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data: DailyLog[]) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

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

      {logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-bold text-app-text text-lg">No logs yet</p>
          <p className="text-secondary text-sm mt-1">
            Start your journey — log your first day
          </p>
          <a
            href="/log"
            className="inline-block mt-4 px-5 py-3 rounded-xl bg-accent text-bg font-bold text-sm hover:bg-accent/80 transition-colors"
          >
            Log Today
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
