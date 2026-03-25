"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyLog } from "@/lib/types";

interface ChartFiberProps {
  logs: DailyLog[];
  goal: number;
  days?: number;
}

export default function ChartFiber({
  logs,
  goal,
  days = 14,
}: ChartFiberProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const data = logs
    .filter((l) => l.date >= cutoffStr && l.fiberGrams != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date.slice(5),
      fiber: log.fiberGrams ?? 0,
    }));

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-secondary text-sm">
        No fiber data yet — start logging!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fiberGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38A89D" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#38A89D" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid #252540",
            borderRadius: 8,
            color: "#e8e8f0",
            fontSize: 12,
          }}
          formatter={(v) => [`${v}g`, "Fiber"]}
        />
        <ReferenceLine
          y={goal}
          stroke="#38A89D"
          strokeDasharray="5 3"
          strokeOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="fiber"
          stroke="#38A89D"
          strokeWidth={2}
          fill="url(#fiberGrad)"
          dot={{ fill: "#38A89D", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#38A89D" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
