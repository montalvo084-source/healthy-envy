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
import { calcProteinTotal, formatDate } from "@/lib/calculations";

interface ChartProteinProps {
  logs: DailyLog[];
  goal: number;
  days?: number;
}

export default function ChartProtein({
  logs,
  goal,
  days = 14,
}: ChartProteinProps) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffStr = formatDate(cutoff);

  const data = logs
    .filter((l) => l.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date.slice(5), // MM-DD
      protein: Math.round(calcProteinTotal(log.proteinEntries ?? [])),
    }));

  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-secondary text-sm">
        No data yet — start logging!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E8A838" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#E8A838" stopOpacity={0} />
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
          formatter={(v) => [`${v}g`, "Protein"]}
        />
        <ReferenceLine
          y={goal}
          stroke="#E8A838"
          strokeDasharray="5 3"
          strokeOpacity={0.5}
        />
        <Area
          type="monotone"
          dataKey="protein"
          stroke="#E8A838"
          strokeWidth={2}
          fill="url(#proteinGrad)"
          dot={{ fill: "#E8A838", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#E8A838" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
