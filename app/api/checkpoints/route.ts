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
      waist: body.waist != null && body.waist !== "" ? Number(body.waist) : null,
      hips: body.hips != null && body.hips !== "" ? Number(body.hips) : null,
      chest: body.chest != null && body.chest !== "" ? Number(body.chest) : null,
      note: body.note ?? null,
    },
  });
  return NextResponse.json(checkpoint, { status: 201 });
}
