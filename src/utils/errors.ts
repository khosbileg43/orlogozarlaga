import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationAppError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(422, message, "VALIDATION_ERROR", details);
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationAppError("Validation failed", error.flatten());
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError(400, "Invalid database request payload", "DB_VALIDATION_ERROR");
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(500, "Database connection is unavailable", "DB_UNAVAILABLE");
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new AppError(500, "Database engine error", "DB_ENGINE_ERROR");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return new AppError(409, "A record with this data already exists", "CONFLICT");
    }

    return new AppError(400, "Database request failed", "DB_ERROR");
  }

  if (error instanceof Error) {
    return new AppError(500, "Internal server error", "INTERNAL_ERROR");
  }

  return new AppError(500, "Internal server error", "INTERNAL_ERROR");
}
