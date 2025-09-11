import { NextResponse } from "next/server";

type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

type Payload = {
  webhook: string;
  frequency: Frequency;
  timezone: string;
  send_hour_local: number;
  portfolio_id?: number;
};

function isDiscordWebhook(url: string) {
  try {
    const u = new URL(url);
    return (
      (u.hostname === "discord.com" || u.hostname === "discordapp.com") &&
      u.pathname.startsWith("/api/webhooks/")
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: Partial<Payload> | null = null;
  try {
    body = (await req.json()) as Partial<Payload>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const freqSet = new Set<Frequency>(["daily", "weekly", "biweekly", "monthly"]);

  if (!body?.webhook || !isDiscordWebhook(body.webhook)) {
    return NextResponse.json({ error: "Invalid Discord webhook" }, { status: 400 });
  }
  if (!body?.frequency || !freqSet.has(body.frequency)) {
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
  }
  if (typeof body?.timezone !== "string" || body.timezone.length < 3) {
    return NextResponse.json({ error: "Invalid timezone" }, { status: 400 });
  }
  if (
    typeof body?.send_hour_local !== "number" ||
    body.send_hour_local < 0 ||
    body.send_hour_local > 23
  ) {
    return NextResponse.json({ error: "Invalid hour (0–23)" }, { status: 400 });
  }

  // Demo response: generate a fake id and schedule ~5 minutes later.
  const id = Math.random().toString(36).slice(2);
  const next_run_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return NextResponse.json({ id, next_run_at });
}
