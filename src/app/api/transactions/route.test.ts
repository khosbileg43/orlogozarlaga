jest.mock("@/controllers/transactions.controller", () => ({
  transactionsController: {
    getMany: jest.fn(),
    create: jest.fn(),
  },
}));

import { NextResponse } from "next/server";
import { transactionsController } from "@/controllers/transactions.controller";
import { GET, POST } from "./route";

describe("/api/transactions route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET delegates to transactionsController.getMany", async () => {
    const req = new Request(
      "http://localhost:3000/api/transactions?month=2026-03&type=INCOME",
    );
    const delegatedResponse = NextResponse.json({ success: true }, { status: 200 });
    (transactionsController.getMany as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await GET(req);

    expect(transactionsController.getMany).toHaveBeenCalledWith(req);
    expect(res).toBe(delegatedResponse);
  });

  it("POST delegates to transactionsController.create", async () => {
    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountId: "a1" }),
    });
    const delegatedResponse = NextResponse.json({ success: true }, { status: 201 });
    (transactionsController.create as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await POST(req);

    expect(transactionsController.create).toHaveBeenCalledWith(req);
    expect(res).toBe(delegatedResponse);
  });
});
