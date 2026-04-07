import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/gut/strategies/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const strategy = await db.diverticulitisStrategy.update({
    where: { id: Number(id) },
    data: {
      text: body.text,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(strategy);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/gut/strategies/[id]">
) {
  const { id } = await ctx.params;
  await db.diverticulitisStrategy.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
