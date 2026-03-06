import { summaryController } from "@/controllers/summary.controller";

export async function GET(req: Request) {
  return summaryController.getMonthly(req);
}
