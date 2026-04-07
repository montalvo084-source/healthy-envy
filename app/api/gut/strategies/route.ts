import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const strategies = await db.diverticulitisStrategy.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(strategies);
  } catch (e) {
    console.error("GET /api/gut/strategies", e);
    return NextResponse.json({ error: "Failed to load strategies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const strategy = await db.diverticulitisStrategy.create({
      data: {
        text: body.text,
        notes: body.notes ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(strategy, { status: 201 });
  } catch (e) {
    console.error("POST /api/gut/strategies", e);
    return NextResponse.json({ error: "Failed to save strategy" }, { status: 500 });
  }
}
