import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const foods = await db.diverticulitisFood.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(foods);
  } catch (e) {
    console.error("GET /api/gut/foods", e);
    return NextResponse.json({ error: "Failed to load foods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const food = await db.diverticulitisFood.create({
      data: {
        name: body.name,
        category: body.category,
        notes: body.notes ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(food, { status: 201 });
  } catch (e) {
    console.error("POST /api/gut/foods", e);
    return NextResponse.json({ error: "Failed to save food" }, { status: 500 });
  }
}
