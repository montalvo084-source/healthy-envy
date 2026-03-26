import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PROTEIN_SOURCES } from "@/lib/protein-sources";

async function seedIfEmpty() {
  const count = await db.proteinSource.count();
  if (count === 0) {
    await db.proteinSource.createMany({
      data: PROTEIN_SOURCES.map((s, i) => ({
        key: s.key,
        label: s.label,
        protein: s.protein,
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
  const sources = await db.proteinSource.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const maxOrder = await db.proteinSource.aggregate({ _max: { sortOrder: true } });
  const source = await db.proteinSource.create({
    data: {
      key: body.key,
      label: body.label,
      protein: Number(body.protein),
      unit: body.unit,
      emoji: body.emoji ?? "🥩",
      active: body.active !== false,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });
  return NextResponse.json(source, { status: 201 });
}
