import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

// Health check
export async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.select().from(users).limit(1);

  return NextResponse.json({ ok: true, dbConnected: user.length > 0 });
}
