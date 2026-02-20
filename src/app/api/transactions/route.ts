import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/getUserId";
import { getMonthRange } from "@/lib/date/monthRange";
import { createTransactionSchema } from "@/lib/validators/transaction";
import { transactionRepo } from "@/server/repositories/transaction.repo";
import { transactionService } from "@/server/services/transaction.service";

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);

    const month =
      searchParams.get("month") ?? new Date().toISOString().slice(0, 7); // YYYY-MM
    const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;

    const { start, end } = getMonthRange(month);
    const transactions = await transactionRepo.list({
      userId,
      start,
      end,
      ...(type ? { type } : {}),
    });

    return NextResponse.json({ ok: true, transactions });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();

    const parsed = createTransactionSchema.parse(body);
    const created = await transactionService.create(userId, {
      accountId: parsed.accountId,
      type: parsed.type,
      category: parsed.category,
      amount: parsed.amount,
      description: parsed.description,
      date: new Date(parsed.date),
    });

    return NextResponse.json(
      { ok: true, transaction: created },
      { status: 201 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 },
    );
  }
}
