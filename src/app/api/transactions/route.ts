import { transactionsController } from "@/controllers/transactions.controller";

export async function GET(req: Request) {
  return transactionsController.getMany(req);
}

export async function POST(req: Request) {
  return transactionsController.create(req);
}
