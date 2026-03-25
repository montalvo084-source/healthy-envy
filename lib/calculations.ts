import type { DailyLog, ProteinEntry } from "@/lib/types";
import { getProteinSource } from "@/lib/protein-sources";

export function calcProteinTotal(entries: ProteinEntry[]): number {
  return entries.reduce((total, entry) => {
    const source = getProteinSource(entry.sourceKey);
    if (!source) return total;
    return total + entry.quantity * source.protein;
  }, 0);
}

export function calcStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDates = new Set(logs.map((l) => l.date));

  let streak = 0;
  const cursor = new Date(today);

  // Check if today is logged; if not, start from yesterday
  const todayStr = formatDate(today);
  if (!logDates.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(cursor);
    if (logDates.has(dateStr)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calcAvgProtein(logs: DailyLog[], days = 14): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = formatDate(cutoff);

  const recent = logs.filter(
    (l) => l.date >= cutoffStr && l.proteinEntries && l.proteinEntries.length > 0
  );

  if (recent.length === 0) return 0;

  const total = recent.reduce((sum, log) => {
    return sum + calcProteinTotal(log.proteinEntries ?? []);
  }, 0);

  return Math.round(total / recent.length);
}

export function calcPhaseDay(startDate: string): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff + 1);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
