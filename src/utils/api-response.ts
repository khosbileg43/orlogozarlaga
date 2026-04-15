import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { normalizeError } from "./errors";
import { logger } from "./logger";

export function ok<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };

  return NextResponse.json(payload, { status });
}

export function fail(error: unknown) {
  const normalized = normalizeError(error);
  logger.error("api.fail", {
    code: normalized.code,
    statusCode: normalized.statusCode,
    message: normalized.message,
    details: normalized.details,
  });
  const payload: ApiResponse<never> = {
    success: false,
    error: normalized.code,
    message: normalized.message,
  };

  return NextResponse.json(payload, { status: normalized.statusCode });
}
