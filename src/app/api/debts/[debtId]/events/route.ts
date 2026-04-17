import { debtsController } from "@/controllers/debts.controller";
import { withObservedRequest } from "@/utils/observability";

type DebtEventRouteContext = {
  params: Promise<{ debtId: string }>;
};

export async function POST(req: Request, context: DebtEventRouteContext) {
  const { debtId } = await context.params;
  return withObservedRequest("api.debts.addEvent", req, () =>
    debtsController.addEvent(req, debtId),
  );
}
