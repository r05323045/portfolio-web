import { NextResponse } from "next/server";
import { SYMBOLS } from "@/lib/symbols";

/** Simple fuzzy search over local list.
 *  Later you can proxy to your Python API here.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();

  const items = q
    ? SYMBOLS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "no-store" } }
  );
}
