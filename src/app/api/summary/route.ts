import { summaryController } from "@/controllers/summary.controller";
import { withObservedRequest } from "@/utils/observability";

export async function GET(req: Request) {
  return withObservedRequest("api.summary.getMonthly", req, () =>
    summaryController.getMonthly(req),
  );
}
