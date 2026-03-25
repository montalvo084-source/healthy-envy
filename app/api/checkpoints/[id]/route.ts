import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/checkpoints/[id]">
) {
  const { id } = await ctx.params;
  await db.checkpoint.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
