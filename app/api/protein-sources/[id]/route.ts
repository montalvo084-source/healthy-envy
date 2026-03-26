import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const source = await db.proteinSource.update({
    where: { id: Number(id) },
    data: {
      label: body.label,
      protein: body.protein !== undefined ? Number(body.protein) : undefined,
      unit: body.unit,
      emoji: body.emoji,
      active: body.active,
    },
  });
  return NextResponse.json(source);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.proteinSource.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
