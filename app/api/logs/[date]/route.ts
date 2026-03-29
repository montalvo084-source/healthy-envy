import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/logs/[date]">
) {
  const { date } = await ctx.params;
  const log = await db.dailyLog.findUnique({
    where: { date },
    include: {
      proteinEntries: true,
      questionAnswers: true,
      phase: true,
    },
  });
  if (!log) return NextResponse.json(null);
  return NextResponse.json(log);
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/logs/[date]">
) {
  const { date } = await ctx.params;
  const body = await request.json();
  const { proteinEntries = [], questionAnswers = [], ...fields } = body;

  const existing = await db.dailyLog.findUnique({ where: { date } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.proteinEntry.deleteMany({ where: { logId: existing.id } });
  await db.questionAnswer.deleteMany({ where: { logId: existing.id } });

  const log = await db.dailyLog.update({
    where: { date },
    data: {
      phaseId: fields.phaseId ?? null,
      proteinPriority:
        fields.proteinPriority != null ? Boolean(fields.proteinPriority) : null,
      fiberGrams:
        fields.fiberGrams != null && fields.fiberGrams !== ""
          ? Number(fields.fiberGrams)
          : null,
      note: fields.note ?? null,
      proteinEntries: {
        create: proteinEntries
          .filter((e: { quantity: number }) => e.quantity > 0)
          .map((e: { sourceKey: string; quantity: number }) => ({
            sourceKey: e.sourceKey,
            quantity: Number(e.quantity),
          })),
      },
      questionAnswers: {
        create: questionAnswers.map(
          (a: { questionKey: string; value: string }) => ({
            questionKey: a.questionKey,
            value: String(a.value),
          })
        ),
      },
    },
    include: { proteinEntries: true, questionAnswers: true, phase: true },
  });

  return NextResponse.json(log);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/logs/[date]">
) {
  const { date } = await ctx.params;
  const existing = await db.dailyLog.findUnique({ where: { date } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.dailyLog.delete({ where: { date } });
  return NextResponse.json({ deleted: true });
}
