import { accountRepo } from "@/server/repositories/account.repo";
import { AppError, NotFoundError } from "@/utils/errors";

export const accountService = {
  listByUser(userId: string) {
    return accountRepo.listByUser(userId);
  },

  async findByIdAndUserId(accountId: string, userId: string) {
    const account = await accountRepo.findByIdAndUserId(accountId, userId);
    if (!account) {
      throw new NotFoundError("Account not found");
    }
    return account;
  },

  async create(userId: string, input: { name: string; balance: number }) {
    const normalizedName = input.name.trim();
    const existing = await accountRepo.findByNameAndUserId(normalizedName, userId);
    if (existing) {
      throw new AppError(409, "Account name already exists", "CONFLICT");
    }

    return accountRepo.create({
      userId,
      name: normalizedName,
      balance: input.balance,
    });
  },
};
