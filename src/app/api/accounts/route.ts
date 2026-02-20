import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/getUserId";
import { accountRepo } from "@/server/repositories/account.repo";

export async function GET() {
  try {
    const userId = await getUserId();
    const accounts = await accountRepo.listByUser(userId);
    return NextResponse.json({ ok: true, accounts });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 },
    );
  }
}
