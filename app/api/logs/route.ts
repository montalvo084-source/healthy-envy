import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const logs = await db.dailyLog.findMany({
    include: {
      proteinEntries: true,
      questionAnswers: true,
      phase: true,
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, proteinEntries = [], questionAnswers = [], ...fields } = body;

  const existing = await db.dailyLog.findUnique({ where: { date } });

  let log;
  if (existing) {
    // Update: delete nested children then re-create
    await db.proteinEntry.deleteMany({ where: { logId: existing.id } });
    await db.questionAnswer.deleteMany({ where: { logId: existing.id } });

    log = await db.dailyLog.update({
      where: { date },
      data: {
        phaseId: fields.phaseId ?? null,
        proteinPriority:
          fields.proteinPriority != null
            ? Boolean(fields.proteinPriority)
            : null,
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
  } else {
    log = await db.dailyLog.create({
      data: {
        date,
        phaseId: fields.phaseId ?? null,
        proteinPriority:
          fields.proteinPriority != null
            ? Boolean(fields.proteinPriority)
            : null,
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
  }

  return NextResponse.json(log, { status: existing ? 200 : 201 });
}
