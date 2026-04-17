import { prisma } from "@/lib/db/prisma";
import {
  DebtCaseDto,
  DebtCategoryDto,
  DebtDirectionDto,
  DebtEventDto,
  DebtStatusDto,
} from "@/types";
import { NotFoundError, ValidationAppError } from "@/utils/errors";
import { debtRepo } from "../repositories/debt.repo";

type DebtCaseRecord = Awaited<ReturnType<typeof debtRepo.findByIdAndUserId>>;
type DebtListRecord = Awaited<ReturnType<typeof debtRepo.listByUserId>>[number];

type DebtEventLike = {
  type: "CREATE" | "ADDITIONAL" | "REPAYMENT" | "SETTLE" | "NOTE";
  amount: number;
};

function computeTotals(events: DebtEventLike[]) {
  const totalAmount = events
    .filter((event) => event.type === "CREATE" || event.type === "ADDITIONAL")
    .reduce((sum, event) => sum + event.amount, 0);

  const repaidAmount = events
    .filter((event) => event.type === "REPAYMENT")
    .reduce((sum, event) => sum + event.amount, 0);

  return {
    totalAmount,
    repaidAmount,
    remainingAmount: Math.max(0, totalAmount - repaidAmount),
  };
}

function deriveStatus(args: {
  status?: DebtStatusDto;
  remainingAmount: number;
}): DebtStatusDto {
  if (args.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (args.remainingAmount <= 0) {
    return "SETTLED";
  }

  return "OPEN";
}

function toEvent(
  event: NonNullable<DebtCaseRecord>["events"][number],
): DebtEventDto {
  return {
    id: event.id,
    debtCaseId: event.debtCaseId,
    actorUserId: event.actorUserId,
    type: event.type,
    amount: event.amount,
    note: event.note,
    eventDate: event.eventDate,
    settlementTransactionId: event.settlementTransactionId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function toDebtCase(
  debt: NonNullable<DebtCaseRecord> | DebtListRecord,
): DebtCaseDto {
  return {
    id: debt.id,
    userId: debt.userId,
    counterpartyUserId: debt.counterpartyUserId,
    personName: debt.personName,
    direction: debt.direction,
    category: debt.category,
    reason: debt.reason,
    note: debt.note,
    openedAt: debt.openedAt,
    dueDate: debt.dueDate,
    status: debt.status,
    totalAmount: debt.totalAmount,
    repaidAmount: debt.repaidAmount,
    remainingAmount: debt.remainingAmount,
    settledAt: debt.settledAt,
    createdAt: debt.createdAt,
    updatedAt: debt.updatedAt,
    counterpartyUser: debt.counterpartyUser,
    events: debt.events.map(toEvent),
  };
}

export const debtService = {
  async listByUser(userId: string) {
    const debts = await debtRepo.listByUserId(userId);
    return debts.map(toDebtCase);
  },

  async findByIdAndUserId(userId: string, debtId: string) {
    const debt = await debtRepo.findByIdAndUserId(debtId, userId);
    if (!debt) {
      throw new NotFoundError("Debt record not found");
    }

    return toDebtCase(debt);
  },

  async create(
    userId: string,
    input: {
      personName: string;
      direction: DebtDirectionDto;
      category: DebtCategoryDto;
      reason: string;
      note?: string | null;
      openedAt: Date;
      dueDate?: Date | null;
      amount: number;
      counterpartyUserId?: string | null;
    },
  ) {
    const totalAmount = input.amount;

    const debt = await prisma.$transaction((tx) =>
      debtRepo.createTx(tx, {
        userId,
        counterpartyUserId: input.counterpartyUserId ?? null,
        personName: input.personName.trim(),
        direction: input.direction,
        category: input.category,
        reason: input.reason.trim(),
        note: input.note?.trim() || null,
        openedAt: input.openedAt,
        dueDate: input.dueDate ?? null,
        status: "OPEN",
        totalAmount,
        repaidAmount: 0,
        remainingAmount: totalAmount,
        settledAt: null,
        createEvent: {
          actorUserId: userId,
          amount: totalAmount,
          note: input.note?.trim() || null,
          eventDate: input.openedAt,
        },
      }),
    );

    return toDebtCase(debt);
  },

  async update(
    userId: string,
    debtId: string,
    input: {
      personName?: string;
      direction?: DebtDirectionDto;
      category?: DebtCategoryDto;
      reason?: string;
      note?: string | null;
      openedAt?: Date;
      dueDate?: Date | null;
      amount?: number;
      status?: DebtStatusDto;
      counterpartyUserId?: string | null;
    },
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await debtRepo.findByIdAndUserIdTx(tx, debtId, userId);
      if (!existing) {
        throw new NotFoundError("Debt record not found");
      }

      const createEvent = await debtRepo.findCreateEventByCaseIdTx(tx, debtId);
      if (!createEvent) {
        throw new ValidationAppError(
          "Debt record is missing its initial event",
        );
      }

      if (
        typeof input.amount !== "undefined" &&
        input.amount < existing.repaidAmount
      ) {
        throw new ValidationAppError(
          "Initial amount cannot be lower than the total repaid amount",
        );
      }

      if (
        typeof input.amount !== "undefined" ||
        typeof input.openedAt !== "undefined" ||
        typeof input.note !== "undefined"
      ) {
        await debtRepo.updateCreateEventByIdTx(tx, {
          eventId: createEvent.id,
          ...(typeof input.amount !== "undefined"
            ? { amount: input.amount }
            : {}),
          ...(typeof input.note !== "undefined"
            ? { note: input.note?.trim() || null }
            : {}),
          ...(input.openedAt ? { eventDate: input.openedAt } : {}),
        });
      }

      const nextEvents = existing.events.map(
        (event: { id: any; amount: any; note: any; eventDate: any }) => {
          if (event.id !== createEvent.id) {
            return event;
          }

          return {
            ...event,
            amount:
              typeof input.amount !== "undefined" ? input.amount : event.amount,
            note:
              typeof input.note !== "undefined"
                ? input.note?.trim() || null
                : event.note,
            eventDate: input.openedAt ?? event.eventDate,
          };
        },
      );

      const totals = computeTotals(nextEvents);
      const status = deriveStatus({
        status: input.status,
        remainingAmount: totals.remainingAmount,
      });

      return debtRepo.updateByIdAndUserIdTx(tx, {
        debtId,
        userId,
        data: {
          ...(typeof input.counterpartyUserId !== "undefined"
            ? { counterpartyUserId: input.counterpartyUserId }
            : {}),
          ...(typeof input.personName !== "undefined"
            ? { personName: input.personName.trim() }
            : {}),
          ...(typeof input.direction !== "undefined"
            ? { direction: input.direction }
            : {}),
          ...(typeof input.category !== "undefined"
            ? { category: input.category }
            : {}),
          ...(typeof input.reason !== "undefined"
            ? { reason: input.reason.trim() }
            : {}),
          ...(typeof input.note !== "undefined"
            ? { note: input.note?.trim() || null }
            : {}),
          ...(typeof input.openedAt !== "undefined"
            ? { openedAt: input.openedAt }
            : {}),
          ...(typeof input.dueDate !== "undefined"
            ? { dueDate: input.dueDate }
            : {}),
          status,
          totalAmount: totals.totalAmount,
          repaidAmount: totals.repaidAmount,
          remainingAmount: totals.remainingAmount,
          settledAt: status === "SETTLED" ? new Date() : null,
        },
      });
    });

    return toDebtCase(updated);
  },

  async addEvent(
    userId: string,
    debtId: string,
    input: {
      type: "REPAYMENT" | "ADDITIONAL" | "NOTE";
      amount: number;
      note?: string | null;
      eventDate: Date;
    },
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await debtRepo.findByIdAndUserIdTx(tx, debtId, userId);
      if (!existing) {
        throw new NotFoundError("Debt record not found");
      }

      if (existing.status === "CANCELLED") {
        throw new ValidationAppError(
          "Cancelled debt records cannot be updated",
        );
      }

      if (input.type === "REPAYMENT") {
        if (input.amount <= 0) {
          throw new ValidationAppError(
            "Repayment amount must be greater than zero",
          );
        }
        if (input.amount > existing.remainingAmount) {
          throw new ValidationAppError(
            "Repayment amount exceeds the remaining balance",
          );
        }
      }

      if (input.type === "ADDITIONAL" && input.amount <= 0) {
        throw new ValidationAppError(
          "Additional amount must be greater than zero",
        );
      }

      if (input.type === "NOTE" && input.amount !== 0) {
        throw new ValidationAppError("Note events cannot include an amount");
      }

      await debtRepo.createEventTx(tx, {
        debtCaseId: debtId,
        actorUserId: userId,
        type: input.type,
        amount: input.amount,
        note: input.note?.trim() || null,
        eventDate: input.eventDate,
      });

      const nextEvents = [
        ...existing.events,
        {
          type: input.type,
          amount: input.amount,
        },
      ];
      const totals = computeTotals(nextEvents);
      const status = deriveStatus({ remainingAmount: totals.remainingAmount });

      return debtRepo.updateByIdAndUserIdTx(tx, {
        debtId,
        userId,
        data: {
          status,
          totalAmount: totals.totalAmount,
          repaidAmount: totals.repaidAmount,
          remainingAmount: totals.remainingAmount,
          settledAt: status === "SETTLED" ? input.eventDate : null,
        },
      });
    });

    return toDebtCase(updated);
  },

  async delete(userId: string, debtId: string) {
    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await debtRepo.findByIdAndUserIdTx(tx, debtId, userId);
      if (!existing) {
        throw new NotFoundError("Debt record not found");
      }

      return debtRepo.deleteByIdAndUserIdTx(tx, {
        debtId,
        userId,
      });
    });

    return toDebtCase(deleted);
  },
};
