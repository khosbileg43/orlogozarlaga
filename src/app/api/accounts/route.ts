import { accountsController } from "@/controllers/accounts.controller";

export async function GET() {
  return accountsController.getMany();
}

export async function POST(req: Request) {
  return accountsController.create(req);
}
