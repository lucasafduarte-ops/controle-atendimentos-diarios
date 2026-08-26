type RecordRow = { month_key: string; day: string; value: string };

function config() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados no servidor",
    );
  }

  return { url, serviceRoleKey };
}

function headers(extra?: Record<string, string>) {
  const { serviceRoleKey } = config();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function fetchAllRecords(): Promise<RecordRow[]> {
  const { url } = config();

  const res = await fetch(
    `${url}/rest/v1/attendance_records?select=month_key,day,value`,
    { headers: headers(), cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Falha ao ler registros do Supabase (${res.status})`);
  }

  return res.json();
}

export async function upsertRecord(monthKey: string, day: string, value: string) {
  const { url } = config();

  const res = await fetch(
    `${url}/rest/v1/attendance_records?on_conflict=month_key,day`,
    {
      method: "POST",
      headers: headers({ Prefer: "resolution=merge-duplicates" }),
      body: JSON.stringify([
        {
          month_key: monthKey,
          day,
          value,
          updated_at: new Date().toISOString(),
        },
      ]),
    },
  );

  if (!res.ok) {
    throw new Error(`Falha ao salvar registro no Supabase (${res.status})`);
  }
}

export async function deleteRecord(monthKey: string, day: string) {
  const { url } = config();

  const res = await fetch(
    `${url}/rest/v1/attendance_records?month_key=eq.${encodeURIComponent(monthKey)}&day=eq.${encodeURIComponent(day)}`,
    { method: "DELETE", headers: headers() },
  );

  if (!res.ok) {
    throw new Error(`Falha ao remover registro no Supabase (${res.status})`);
  }
}

export async function upsertMissingRecords(entries: RecordRow[]) {
  if (!entries.length) return;
  const { url } = config();

  const res = await fetch(
    `${url}/rest/v1/attendance_records?on_conflict=month_key,day`,
    {
      method: "POST",
      headers: headers({ Prefer: "resolution=ignore-duplicates" }),
      body: JSON.stringify(
        entries.map((entry) => ({
          ...entry,
          updated_at: new Date().toISOString(),
        })),
      ),
    },
  );

  if (!res.ok) {
    throw new Error(`Falha na migração para o Supabase (${res.status})`);
  }
}
