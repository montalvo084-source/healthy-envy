import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FIBER_SOURCES } from "@/lib/fiber-sources";

async function seedIfEmpty() {
  const count = await db.fiberSource.count();
  if (count === 0) {
    await db.fiberSource.createMany({
      data: FIBER_SOURCES.map((s, i) => ({
        key: s.key,
        label: s.label,
        fiber: s.fiber,
        unit: s.unit,
        emoji: s.emoji,
        active: s.active,
        sortOrder: i,
      })),
    });
  }
}

export async function GET() {
  await seedIfEmpty();
  const sources = await db.fiberSource.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const maxOrder = await db.fiberSource.aggregate({ _max: { sortOrder: true } });
  const source = await db.fiberSource.create({
    data: {
      key: body.key,
      label: body.label,
      fiber: Number(body.fiber),
      unit: body.unit,
      emoji: body.emoji ?? "🌿",
      active: body.active !== false,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json(source, { status: 201 });
}
