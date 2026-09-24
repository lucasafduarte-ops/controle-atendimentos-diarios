import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";
import { upsertMissingGoals } from "../../../lib/supabase";

export async function POST(request: Request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const goals = body?.goals;

  if (!goals || typeof goals !== "object") {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const entries = Object.entries(goals as Record<string, unknown>).map(
    ([monthKey, value]) => ({ month_key: monthKey, value: Number(value) }),
  );

  try {
    await upsertMissingGoals(entries);
    return NextResponse.json({ ok: true, count: entries.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}
