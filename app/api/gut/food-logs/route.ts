import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const logs = await db.gutFoodLog.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(logs);
  } catch (e) {
    console.error("GET /api/gut/food-logs", e);
    return NextResponse.json({ error: "Failed to load food logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const log = await db.gutFoodLog.create({
      data: {
        date: body.date,
        food: body.food,
        notes: body.notes ?? null,
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (e) {
    console.error("POST /api/gut/food-logs", e);
    return NextResponse.json({ error: "Failed to save food log" }, { status: 500 });
  }
}
