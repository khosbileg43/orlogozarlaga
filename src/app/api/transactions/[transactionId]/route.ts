import { transactionsController } from "@/controllers/transactions.controller";

type TransactionRouteContext = {
  params: Promise<{ transactionId: string }>;
};

export async function GET(
  _req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return transactionsController.getById(transactionId);
}

export async function PATCH(
  req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return transactionsController.update(req, transactionId);
}

export async function DELETE(
  _req: Request,
  context: TransactionRouteContext,
) {
  const { transactionId } = await context.params;
  return transactionsController.remove(transactionId);
}
