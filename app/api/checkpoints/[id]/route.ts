import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/checkpoints/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const checkpoint = await db.checkpoint.update({
    where: { id: Number(id) },
    data: {
      date: body.date,
      waist: body.waist != null && body.waist !== "" ? Number(body.waist) : null,
      hips: body.hips != null && body.hips !== "" ? Number(body.hips) : null,
      chest: body.chest != null && body.chest !== "" ? Number(body.chest) : null,
      note: body.note ?? null,
    },
  });
  return NextResponse.json(checkpoint);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/checkpoints/[id]">
) {
  const { id } = await ctx.params;
  await db.checkpoint.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
