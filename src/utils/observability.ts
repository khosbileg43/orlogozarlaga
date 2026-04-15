import { logger } from "@/utils/logger";

export async function withObservedRequest(
  name: string,
  req: Request,
  run: () => Promise<Response>,
) {
  const startedAt = Date.now();
  const url = new URL(req.url);

  try {
    const response = await run();
    logger.info("request.completed", {
      name,
      method: req.method,
      path: url.pathname,
      status: response.status,
      durationMs: Date.now() - startedAt,
    });
    return response;
  } catch (error: unknown) {
    logger.error("request.failed", {
      name,
      method: req.method,
      path: url.pathname,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
