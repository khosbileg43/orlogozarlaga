jest.mock("@/controllers/lobbies.controller", () => ({
  lobbiesController: {
    getMany: jest.fn(),
    create: jest.fn(),
  },
}));

import { NextResponse } from "next/server";
import { lobbiesController } from "@/controllers/lobbies.controller";
import { GET, POST } from "./route";

describe("/api/lobbies route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET delegates to lobbiesController.getMany", async () => {
    const req = new Request("http://localhost:3000/api/lobbies");
    const delegatedResponse = NextResponse.json({ success: true }, { status: 200 });
    (lobbiesController.getMany as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await GET(req);

    expect(lobbiesController.getMany).toHaveBeenCalledWith();
    expect(res).toBe(delegatedResponse);
  });

  it("POST delegates to lobbiesController.create", async () => {
    const req = new Request("http://localhost:3000/api/lobbies", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Trip Fund" }),
    });
    const delegatedResponse = NextResponse.json({ success: true }, { status: 201 });
    (lobbiesController.create as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await POST(req);

    expect(lobbiesController.create).toHaveBeenCalledWith(req);
    expect(res).toBe(delegatedResponse);
  });
});
