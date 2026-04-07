import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const strategies = await db.diverticulitisStrategy.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(strategies);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const strategy = await db.diverticulitisStrategy.create({
    data: {
      text: body.text,
      notes: body.notes ?? null,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json(strategy, { status: 201 });
}
