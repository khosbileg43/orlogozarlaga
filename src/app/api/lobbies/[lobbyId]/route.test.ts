jest.mock("@/controllers/lobbies.controller", () => ({
  lobbiesController: {
    getById: jest.fn(),
    update: jest.fn(),
  },
}));

import { NextResponse } from "next/server";
import { lobbiesController } from "@/controllers/lobbies.controller";
import { GET, PATCH } from "./route";

describe("/api/lobbies/[lobbyId] route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET delegates to lobbiesController.getById", async () => {
    const req = new Request("http://localhost:3000/api/lobbies/l1");
    const delegatedResponse = NextResponse.json({ success: true }, { status: 200 });
    (lobbiesController.getById as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await GET(req, {
      params: Promise.resolve({ lobbyId: "l1" }),
    });

    expect(lobbiesController.getById).toHaveBeenCalledWith("l1");
    expect(res).toBe(delegatedResponse);
  });

  it("PATCH delegates to lobbiesController.update", async () => {
    const req = new Request("http://localhost:3000/api/lobbies/l1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Renamed" }),
    });
    const delegatedResponse = NextResponse.json({ success: true }, { status: 200 });
    (lobbiesController.update as jest.Mock).mockResolvedValue(delegatedResponse);

    const res = await PATCH(req, {
      params: Promise.resolve({ lobbyId: "l1" }),
    });

    expect(lobbiesController.update).toHaveBeenCalledWith(req, "l1");
    expect(res).toBe(delegatedResponse);
  });
});
