import { accountsController } from "@/controllers/accounts.controller";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.accounts.get", req, () =>
    accountsController.getMany(),
  );
}

export async function POST(req: Request) {
  return withObservedRequest("api.accounts.create", req, () =>
    accountsController.create(req),
  );
}
