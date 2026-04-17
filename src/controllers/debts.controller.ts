import { authService } from "@/server/services/auth.service";
import { debtService } from "@/server/services/debt.service";
import { fail, ok } from "@/utils/api-response";
import {
  createDebtEventSchema,
  createDebtSchema,
  debtIdParamSchema,
  updateDebtSchema,
} from "@/validators/debt.validator";

export const debtsController = {
  async getMany() {
    try {
      const user = await authService.requireAuthenticatedUser();
      const debts = await debtService.listByUser(user.id);
      return ok({ debts });
    } catch (error) {
      return fail(error);
    }
  },

  async getById(debtId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { debtId: parsedDebtId } = debtIdParamSchema.parse({ debtId });
      const debt = await debtService.findByIdAndUserId(user.id, parsedDebtId);
      return ok({ debt });
    } catch (error) {
      return fail(error);
    }
  },

  async create(req: Request) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const body = await req.json();
      const parsed = createDebtSchema.parse(body);
      const debt = await debtService.create(user.id, {
        personName: parsed.personName,
        direction: parsed.direction,
        category: parsed.category,
        reason: parsed.reason,
        note: parsed.note,
        openedAt: new Date(parsed.openedAt),
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        amount: parsed.amount,
        counterpartyUserId: parsed.counterpartyUserId,
      });
      return ok({ debt }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async update(req: Request, debtId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { debtId: parsedDebtId } = debtIdParamSchema.parse({ debtId });
      const body = await req.json();
      const parsed = updateDebtSchema.parse(body);
      const debt = await debtService.update(user.id, parsedDebtId, {
        ...(typeof parsed.personName !== "undefined" ? { personName: parsed.personName } : {}),
        ...(typeof parsed.direction !== "undefined" ? { direction: parsed.direction } : {}),
        ...(typeof parsed.category !== "undefined" ? { category: parsed.category } : {}),
        ...(typeof parsed.reason !== "undefined" ? { reason: parsed.reason } : {}),
        ...(typeof parsed.note !== "undefined" ? { note: parsed.note } : {}),
        ...(parsed.openedAt ? { openedAt: new Date(parsed.openedAt) } : {}),
        ...(typeof parsed.dueDate !== "undefined"
          ? { dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null }
          : {}),
        ...(typeof parsed.amount !== "undefined" ? { amount: parsed.amount } : {}),
        ...(typeof parsed.status !== "undefined" ? { status: parsed.status } : {}),
        ...(typeof parsed.counterpartyUserId !== "undefined"
          ? { counterpartyUserId: parsed.counterpartyUserId }
          : {}),
      });
      return ok({ debt });
    } catch (error) {
      return fail(error);
    }
  },

  async addEvent(req: Request, debtId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { debtId: parsedDebtId } = debtIdParamSchema.parse({ debtId });
      const body = await req.json();
      const parsed = createDebtEventSchema.parse(body);
      const debt = await debtService.addEvent(user.id, parsedDebtId, {
        type: parsed.type,
        amount: parsed.amount,
        note: parsed.note,
        eventDate: new Date(parsed.eventDate),
      });
      return ok({ debt }, 201);
    } catch (error) {
      return fail(error);
    }
  },

  async remove(debtId: string) {
    try {
      const user = await authService.requireAuthenticatedUser();
      const { debtId: parsedDebtId } = debtIdParamSchema.parse({ debtId });
      const debt = await debtService.delete(user.id, parsedDebtId);
      return ok({ debt });
    } catch (error) {
      return fail(error);
    }
  },
};
