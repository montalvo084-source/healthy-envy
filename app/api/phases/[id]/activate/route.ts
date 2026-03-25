import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  _req: NextRequest,
  ctx: RouteContext<"/api/phases/[id]/activate">
) {
  const { id } = await ctx.params;
  const numId = Number(id);

  await db.$transaction([
    db.phase.updateMany({ where: {}, data: { active: false } }),
    db.phase.update({ where: { id: numId }, data: { active: true } }),
  ]);

  const phase = await db.phase.findUnique({
    where: { id: numId },
    include: { questions: true },
  });

  return NextResponse.json(phase);
}
