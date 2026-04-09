import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const log = await db.gutFoodLog.update({
    where: { id: Number(id) },
    data: {
      date: body.date,
      food: body.food,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(log);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  await db.gutFoodLog.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
