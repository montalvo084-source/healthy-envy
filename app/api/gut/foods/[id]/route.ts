import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/gut/foods/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const food = await db.diverticulitisFood.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      category: body.category,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(food);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/gut/foods/[id]">
) {
  const { id } = await ctx.params;
  await db.diverticulitisFood.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
