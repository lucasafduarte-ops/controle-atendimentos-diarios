import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/auth";
import { upsertMissingRecords } from "../../../lib/supabase";

export async function POST(request: Request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const records = body?.records;

  if (!records || typeof records !== "object") {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const entries: { month_key: string; day: string; value: string }[] = [];

  for (const [monthKey, days] of Object.entries(
    records as Record<string, Record<string, unknown>>,
  )) {
    for (const [day, value] of Object.entries(days)) {
      entries.push({ month_key: monthKey, day, value: String(value) });
    }
  }

  try {
    await upsertMissingRecords(entries);
    return NextResponse.json({ ok: true, count: entries.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}
