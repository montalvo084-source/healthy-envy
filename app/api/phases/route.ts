import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_PHASES = [
  {
    name: "Increased Protein",
    description:
      "Test the effect of consistently hitting your protein goal each day.",
    icon: "🥩",
    color: "#E8A838",
    trackProtein: true,
    sortOrder: 0,
    duration: 14,
  },
  {
    name: "Protein + Fiber Focus",
    description: "Layer in a daily fiber goal on top of high protein intake.",
    icon: "🌿",
    color: "#38A89D",
    trackProtein: true,
    sortOrder: 1,
    duration: 14,
  },
  {
    name: "Optimized Nutrition",
    description: "Hit both your protein and fiber targets consistently.",
    icon: "🧪",
    color: "#7C6EE7",
    trackProtein: true,
    sortOrder: 2,
    duration: 14,
  },
];

export async function GET() {
  const count = await db.phase.count();

  if (count === 0) {
    const now = new Date();
    await db.phase.createMany({
      data: DEFAULT_PHASES.map((p) => {
        const start = new Date(now);
        const end = new Date(now);
        end.setDate(end.getDate() + p.duration - 1);
        return {
          name: p.name,
          description: p.description,
          icon: p.icon,
          color: p.color,
          trackProtein: p.trackProtein,
          sortOrder: p.sortOrder,
          duration: p.duration,
          startDate: start,
          endDate: end,
          active: false,
        };
      }),
    });
  }

  const phases = await db.phase.findMany({
    include: { questions: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(phases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const startDate = new Date(body.startDate);
  const duration = Number(body.duration) || 14;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);

  const phase = await db.phase.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      icon: body.icon ?? "🧪",
      color: body.color ?? "#E8A838",
      startDate,
      endDate,
      duration,
      trackProtein: body.trackProtein ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
    include: { questions: true },
  });

  return NextResponse.json(phase, { status: 201 });
}
