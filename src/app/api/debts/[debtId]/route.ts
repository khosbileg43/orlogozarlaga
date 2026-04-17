import { debtsController } from "@/controllers/debts.controller";
import { withObservedRequest } from "@/utils/observability";

type DebtRouteContext = {
  params: Promise<{ debtId: string }>;
};

export async function GET(req: Request, context: DebtRouteContext) {
  const { debtId } = await context.params;
  return withObservedRequest("api.debts.getById", req, () =>
    debtsController.getById(debtId),
  );
}

export async function PATCH(req: Request, context: DebtRouteContext) {
  const { debtId } = await context.params;
  return withObservedRequest("api.debts.update", req, () =>
    debtsController.update(req, debtId),
  );
}

export async function DELETE(req: Request, context: DebtRouteContext) {
  const { debtId } = await context.params;
  return withObservedRequest("api.debts.delete", req, () =>
    debtsController.remove(debtId),
  );
}
