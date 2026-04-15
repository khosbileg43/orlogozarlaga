import { transactionsController } from "@/controllers/transactions.controller";
import { withObservedRequest } from "@/utils/observability";

type TransactionRouteContext = {
  params: Promise<{ transactionId: string }>;
};

export async function GET(
  req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return withObservedRequest("api.transactions.getById", req, () =>
    transactionsController.getById(transactionId),
  );
}

export async function PATCH(
  req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return withObservedRequest("api.transactions.update", req, () =>
    transactionsController.update(req, transactionId),
  );
}

export async function DELETE(
  req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return withObservedRequest("api.transactions.delete", req, () =>
    transactionsController.remove(transactionId),
  );
}
