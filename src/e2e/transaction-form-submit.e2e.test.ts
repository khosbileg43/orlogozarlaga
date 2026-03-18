jest.mock("@/server/services/auth.service", () => ({
  authService: {
    requireAuthenticatedUser: jest.fn(),
  },
}));

jest.mock("@/server/services/transaction.service", () => ({
  transactionService: {
    create: jest.fn(),
    list: jest.fn(),
    findByIdAndUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

import { authService } from "@/server/services/auth.service";
import { transactionService } from "@/server/services/transaction.service";
import { transactionsController } from "@/controllers/transactions.controller";

describe("transaction form submit e2e smoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits a form-like payload through create controller flow", async () => {
    (authService.requireAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: "u1",
      auth0Id: "local:u1",
      email: "demo@user.com",
      name: "Demo User",
    });

    (transactionService.create as jest.Mock).mockResolvedValue({
      id: "tx-1",
      accountId: "acc-1",
      type: "INCOME",
      category: "Salary",
      amount: 1200,
      description: "Monthly salary",
      date: new Date("2026-03-18T00:00:00.000Z"),
      toAccountId: null,
    });

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: "acc-1",
        type: "INCOME",
        category: "Salary",
        amount: 1200,
        description: "Monthly salary",
        date: "2026-03-18T00:00:00.000Z",
      }),
    });

    const response = await transactionsController.create(req);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(transactionService.create).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        accountId: "acc-1",
        type: "INCOME",
        amount: 1200,
      }),
    );
  });
});
