import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { normalizeError } from "./errors";

export function ok<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(payload, { status });
}

export function fail(error: unknown) {
  const normalized = normalizeError(error);
  const payload: ApiResponse<never> = {
    success: false,
    error: normalized.code,
    message: normalized.message,
  };

  return NextResponse.json(payload, { status: normalized.statusCode });
}
