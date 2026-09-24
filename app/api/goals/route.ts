import { NextResponse } from "next/server";
import { requireAuth } from "../../lib/auth";
import { deleteGoal, fetchAllGoals, upsertGoal } from "../../lib/supabase";

export async function GET(request: Request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  try {
    const rows = await fetchAllGoals();
    const goals: Record<string, number> = {};

    for (const row of rows) {
      goals[row.month_key] = row.value;
    }

    return NextResponse.json({ goals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const monthKey = body?.monthKey;
  const value = body?.value;

  if (typeof monthKey !== "string") {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  try {
    if (value === null || value === undefined) {
      await deleteGoal(monthKey);
    } else {
      await upsertGoal(monthKey, Number(value));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}
