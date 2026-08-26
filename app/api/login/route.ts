import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pin = body?.pin;
  const expected = process.env.APP_PIN;

  if (!expected) {
    return NextResponse.json(
      { error: "APP_PIN não configurado no servidor" },
      { status: 500 },
    );
  }

  if (typeof pin !== "string" || pin !== expected) {
    return NextResponse.json({ error: "PIN incorreto" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
