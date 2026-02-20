import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/getUserId";
import { getMonthRange } from "@/lib/date/monthRange";
import { summaryService } from "@/server/services/summary.service";

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);

    const month =
      searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    const { start, end } = getMonthRange(month);

    const summary = await summaryService.monthly(userId, start, end);
    return NextResponse.json({ ok: true, ...summary });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 },
    );
  }
}
