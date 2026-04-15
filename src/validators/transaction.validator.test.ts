import { listTransactionsQuerySchema } from "./transaction.validator";

describe("listTransactionsQuerySchema", () => {
  it("parses page/limit when provided as strings", () => {
    const parsed = listTransactionsQuerySchema.parse({
      month: "2026-03",
      type: "INCOME",
      page: "2",
      limit: "25",
    });

    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(25);
  });

  it("rejects invalid page value", () => {
    expect(() =>
      listTransactionsQuerySchema.parse({
        month: "2026-03",
        page: "0",
      }),
    ).toThrow();
  });

  it("rejects invalid limit value", () => {
    expect(() =>
      listTransactionsQuerySchema.parse({
        month: "2026-03",
        limit: "999",
      }),
    ).toThrow();
  });
});
