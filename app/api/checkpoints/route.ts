import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const checkpoints = await db.checkpoint.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(checkpoints);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const checkpoint = await db.checkpoint.create({
    data: {
      date: body.date,
      weight: body.weight != null && body.weight !== "" ? Number(body.weight) : null,
      waist: body.waist != null && body.waist !== "" ? Number(body.waist) : null,
      chest: body.chest != null && body.chest !== "" ? Number(body.chest) : null,
      arms: body.arms != null && body.arms !== "" ? Number(body.arms) : null,
      note: body.note ?? null,
    },
  });
  return NextResponse.json(checkpoint, { status: 201 });
}
