import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const phases = await db.diverticulitisPhase.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(phases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Deactivate all existing phases first
  await db.diverticulitisPhase.updateMany({ data: { active: false } });
  const phase = await db.diverticulitisPhase.create({
    data: {
      name: body.name,
      notes: body.notes ?? null,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      active: true,
    },
  });
  return NextResponse.json(phase, { status: 201 });
}
