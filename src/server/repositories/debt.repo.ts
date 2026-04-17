import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const userSelect = {
  id: true,
  email: true,
  name: true,
} as const;

const debtEventSelect = {
  id: true,
  debtCaseId: true,
  actorUserId: true,
  type: true,
  amount: true,
  note: true,
  eventDate: true,
  settlementTransactionId: true,
  createdAt: true,
  updatedAt: true,
} as const;

const debtEventsOrderBy: Prisma.DebtEventOrderByWithRelationInput[] = [
  { eventDate: "desc" },
  { createdAt: "desc" },
];

const debtCaseSelect = {
  id: true,
  userId: true,
  counterpartyUserId: true,
  personName: true,
  direction: true,
  category: true,
  reason: true,
  note: true,
  openedAt: true,
  dueDate: true,
  status: true,
  totalAmount: true,
  repaidAmount: true,
  remainingAmount: true,
  settledAt: true,
  createdAt: true,
  updatedAt: true,
  counterpartyUser: {
    select: userSelect,
  },
  events: {
    select: debtEventSelect,
    orderBy: debtEventsOrderBy,
  },
} as const;

export const debtRepo = {
  listByUserId(userId: string) {
    return prisma.debtCase.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: debtCaseSelect,
    });
  },

  findByIdAndUserId(debtId: string, userId: string) {
    return prisma.debtCase.findFirst({
      where: { id: debtId, userId },
      select: debtCaseSelect,
    });
  },

  findByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    debtId: string,
    userId: string,
  ) {
    return tx.debtCase.findFirst({
      where: { id: debtId, userId },
      select: debtCaseSelect,
    });
  },

  findCreateEventByCaseIdTx(tx: Prisma.TransactionClient, debtCaseId: string) {
    return tx.debtEvent.findFirst({
      where: {
        debtCaseId,
        type: "CREATE",
      },
      orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
      select: debtEventSelect,
    });
  },

  createTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      counterpartyUserId?: string | null;
      personName: string;
      direction: "I_OWE" | "OWES_ME";
      category: "FAMILY" | "FRIENDS" | "WORK" | "EMERGENCY" | "BUSINESS" | "OTHER";
      reason: string;
      note: string | null;
      openedAt: Date;
      dueDate: Date | null;
      status: "OPEN" | "SETTLED" | "CANCELLED";
      totalAmount: number;
      repaidAmount: number;
      remainingAmount: number;
      settledAt: Date | null;
      createEvent: {
        actorUserId?: string | null;
        amount: number;
        note: string | null;
        eventDate: Date;
      };
    },
  ) {
    return tx.debtCase.create({
      data: {
        userId: data.userId,
        counterpartyUserId: data.counterpartyUserId ?? null,
        personName: data.personName,
        direction: data.direction,
        category: data.category,
        reason: data.reason,
        note: data.note,
        openedAt: data.openedAt,
        dueDate: data.dueDate,
        status: data.status,
        totalAmount: data.totalAmount,
        repaidAmount: data.repaidAmount,
        remainingAmount: data.remainingAmount,
        settledAt: data.settledAt,
        events: {
          create: {
            actorUserId: data.createEvent.actorUserId ?? null,
            type: "CREATE",
            amount: data.createEvent.amount,
            note: data.createEvent.note,
            eventDate: data.createEvent.eventDate,
          },
        },
      },
      select: debtCaseSelect,
    });
  },

  updateCreateEventByIdTx(
    tx: Prisma.TransactionClient,
    args: {
      eventId: string;
      amount?: number;
      note?: string | null;
      eventDate?: Date;
    },
  ) {
    return tx.debtEvent.update({
      where: { id: args.eventId },
      data: {
        ...(typeof args.amount !== "undefined" ? { amount: args.amount } : {}),
        ...(typeof args.note !== "undefined" ? { note: args.note } : {}),
        ...(args.eventDate ? { eventDate: args.eventDate } : {}),
      },
      select: debtEventSelect,
    });
  },

  updateByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    args: {
      debtId: string;
      userId: string;
      data: {
        counterpartyUserId?: string | null;
        personName?: string;
        direction?: "I_OWE" | "OWES_ME";
        category?: "FAMILY" | "FRIENDS" | "WORK" | "EMERGENCY" | "BUSINESS" | "OTHER";
        reason?: string;
        note?: string | null;
        openedAt?: Date;
        dueDate?: Date | null;
        status?: "OPEN" | "SETTLED" | "CANCELLED";
        totalAmount?: number;
        repaidAmount?: number;
        remainingAmount?: number;
        settledAt?: Date | null;
      };
    },
  ) {
    return tx.debtCase.update({
      where: { id: args.debtId, userId: args.userId },
      data: args.data,
      select: debtCaseSelect,
    });
  },

  createEventTx(
    tx: Prisma.TransactionClient,
    data: {
      debtCaseId: string;
      actorUserId?: string | null;
      type: "ADDITIONAL" | "REPAYMENT" | "NOTE";
      amount: number;
      note: string | null;
      eventDate: Date;
    },
  ) {
    return tx.debtEvent.create({
      data: {
        debtCaseId: data.debtCaseId,
        actorUserId: data.actorUserId ?? null,
        type: data.type,
        amount: data.amount,
        note: data.note,
        eventDate: data.eventDate,
      },
      select: debtEventSelect,
    });
  },

  deleteByIdAndUserIdTx(
    tx: Prisma.TransactionClient,
    args: {
      debtId: string;
      userId: string;
    },
  ) {
    return tx.debtCase.delete({
      where: { id: args.debtId, userId: args.userId },
      select: debtCaseSelect,
    });
  },
};
