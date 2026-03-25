import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const profile = await db.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Gabriel",
      age: 30,
      proteinGoal: 120,
      unit: "lbs",
    },
  });
  return NextResponse.json(profile);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const profile = await db.profile.upsert({
    where: { id: 1 },
    update: {
      name: body.name,
      age: body.age !== undefined ? Number(body.age) : undefined,
      proteinGoal:
        body.proteinGoal !== undefined ? Number(body.proteinGoal) : undefined,
      fiberGoal:
        body.fiberGoal !== undefined ? Number(body.fiberGoal) : undefined,
      unit: body.unit,
      startWeight:
        body.startWeight !== undefined
          ? body.startWeight === ""
            ? null
            : Number(body.startWeight)
          : undefined,
      startWaist:
        body.startWaist !== undefined
          ? body.startWaist === ""
            ? null
            : Number(body.startWaist)
          : undefined,
      startChest:
        body.startChest !== undefined
          ? body.startChest === ""
            ? null
            : Number(body.startChest)
          : undefined,
      startArms:
        body.startArms !== undefined
          ? body.startArms === ""
            ? null
            : Number(body.startArms)
          : undefined,
    },
    create: {
      id: 1,
      name: body.name ?? "Gabriel",
      age: body.age ? Number(body.age) : 30,
      proteinGoal: body.proteinGoal ? Number(body.proteinGoal) : 120,
      unit: body.unit ?? "lbs",
    },
  });
  return NextResponse.json(profile);
}
