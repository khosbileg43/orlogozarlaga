import { debtsController } from "@/controllers/debts.controller";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.debts.list", req, () => debtsController.getMany());
}

export async function POST(req: Request) {
  return withObservedRequest("api.debts.create", req, () => debtsController.create(req));
}
