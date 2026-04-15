import { transactionsController } from "@/controllers/transactions.controller";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.transactions.getMany", req, () =>
    transactionsController.getMany(req),
  );
}

export async function POST(req: Request) {
  return withObservedRequest("api.transactions.create", req, () =>
    transactionsController.create(req),
  );
}
