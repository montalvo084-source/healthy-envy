import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE() {
  // Delete in dependency order
  await db.questionAnswer.deleteMany({});
  await db.proteinEntry.deleteMany({});
  await db.dailyLog.deleteMany({});
  await db.phaseQuestion.deleteMany({});
  await db.phase.deleteMany({});
  await db.checkpoint.deleteMany({});
  await db.profile.deleteMany({});
  return NextResponse.json({ reset: true });
}
