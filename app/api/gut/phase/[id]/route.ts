import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/gut/phase/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const phase = await db.diverticulitisPhase.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      notes: body.notes ?? null,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      active: body.active ?? undefined,
    },
  });
  return NextResponse.json(phase);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/gut/phase/[id]">
) {
  const { id } = await ctx.params;
  await db.diverticulitisPhase.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
