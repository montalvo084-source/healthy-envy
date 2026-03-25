import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/phases/[id]">
) {
  const { id } = await ctx.params;
  const phase = await db.phase.findUnique({
    where: { id: Number(id) },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!phase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(phase);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/phases/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const startDate = new Date(body.startDate);
  const duration = Number(body.duration) || 14;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);

  const phase = await db.phase.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      description: body.description ?? null,
      icon: body.icon ?? "🧪",
      color: body.color ?? "#E8A838",
      startDate,
      endDate,
      duration,
      trackProtein: body.trackProtein ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(phase);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/phases/[id]">
) {
  const { id } = await ctx.params;
  await db.phase.delete({ where: { id: Number(id) } });
  return NextResponse.json({ deleted: true });
}
