import { NextResponse } from "next/server";
import { requireAuth } from "../../lib/auth";
import { deleteRecord, fetchAllRecords, upsertRecord } from "../../lib/supabase";

type DayValue = number | "off";
type Records = Record<string, Record<string, DayValue>>;

export async function GET(request: Request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  try {
    const rows = await fetchAllRecords();
    const records: Records = {};

    for (const row of rows) {
      records[row.month_key] ??= {};
      records[row.month_key][row.day] =
        row.value === "off" ? "off" : Number(row.value);
    }

    return NextResponse.json({ records });
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
  const day = body?.day;
  const value = body?.value;

  if (typeof monthKey !== "string" || typeof day !== "string") {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  try {
    if (value === null || value === undefined) {
      await deleteRecord(monthKey, day);
    } else {
      await upsertRecord(monthKey, day, String(value));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}
