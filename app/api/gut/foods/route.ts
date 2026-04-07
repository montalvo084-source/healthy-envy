import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const foods = await db.diverticulitisFood.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(foods);
}

export async function POST(request: NextRequest) {
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
}
