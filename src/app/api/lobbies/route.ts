import { lobbiesController } from "@/controllers/lobbies.controller";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.lobbies.list", req, () =>
    lobbiesController.getMany(),
  );
}

export async function POST(req: Request) {
  return withObservedRequest("api.lobbies.create", req, () =>
    lobbiesController.create(req),
  );
}
