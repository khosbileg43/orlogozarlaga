# AGENTS.md

## Project Overview

This project is an Expense and Income Management App built with:

- Next.js (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth0
- Tailwind CSS
- Zod

The backend follows a layered architecture:

- Controller
- Service
- Repository

Goal: keep the codebase modular, secure, strongly typed, and easy to maintain.

---

## Core Rules

### 1. Architecture

Always follow this backend flow:

`API Route -> Controller -> Service -> Repository -> Prisma/PostgreSQL`

Rules:

- API routes must not access Prisma directly
- Controllers must not contain database logic
- Repositories must not contain business logic
- Services contain business rules and orchestration
- Validation should happen before service execution using Zod

---

### 2. Authentication and Authorization

Auth is handled with Auth0.

Rules:

- Only authenticated users can access protected pages and APIs
- Every query for transactions, categories, reports, or dashboard data must be scoped to the authenticated user
- Never expose another user’s data
- On first login, create a local `User` record if it does not exist
- Use Auth0 session/user identity as the source of truth for logged-in user identity

---

### 3. Database Access

Prisma is the only ORM allowed.

Rules:

- All DB access must go through repositories
- Never call Prisma from controllers, UI components, or page files
- Add indexes for commonly filtered fields
- Use Prisma relations cleanly
- Use migrations for schema changes
- Keep schema normalized and maintainable

---

### 4. Validation

Use Zod for request validation.

Rules:

- Every create/update/filter endpoint must have a Zod schema
- Validate request body, query params, and route params where applicable
- Return consistent validation error responses
- Avoid silent coercion unless explicitly intended

---

### 5. Type Safety

Use strict TypeScript patterns everywhere.

Rules:

- Avoid `any`
- Prefer explicit DTOs for request/response contracts
- Define shared types in `src/types`
- Keep service and controller signatures typed
- Infer types from Zod where possible

---

### 6. Error Handling

Use centralized and predictable error handling.

Rules:

- Do not throw raw database errors to clients
- Convert known failures into domain-safe error messages
- Use consistent API response shapes
- Handle not found, unauthorized, forbidden, and validation errors clearly

Suggested response shape:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```
