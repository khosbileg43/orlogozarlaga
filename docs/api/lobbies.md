# Lobbies API

All lobby endpoints require an authenticated Auth0 session and return the shared API envelope:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

Important wire-format note:

- All date fields are serialized as ISO strings in JSON.
- Frontend should treat `createdAt`, `updatedAt`, and `joinedAt` as `string`, not `Date`.

## GET `/api/lobbies`

Returns the lobbies where the current user is an active member.

Response data shape:

```ts
type ListLobbiesResponseDto = {
  lobbies: Array<{
    id: string;
    name: string;
    description: string | null;
    balance: number;
    createdById: string;
    role: "OWNER" | "MEMBER";
    status: "ACTIVE" | "LEFT";
    memberCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
};
```

Example success response:

```json
{
  "success": true,
  "data": {
    "lobbies": [
      {
        "id": "clx123",
        "name": "Trip Fund",
        "description": "Summer trip budget",
        "balance": 0,
        "createdById": "usr_1",
        "role": "OWNER",
        "status": "ACTIVE",
        "memberCount": 3,
        "createdAt": "2026-04-15T11:30:00.000Z",
        "updatedAt": "2026-04-15T11:30:00.000Z"
      }
    ]
  }
}
```

## POST `/api/lobbies`

Creates a new lobby. The authenticated user is automatically added as the `OWNER`.

Request body:

```ts
type CreateLobbyRequestDto = {
  name: string;
  description?: string | null;
};
```

Validation:

- `name`: required, trimmed, 1-80 chars
- `description`: optional, trimmed, max 240 chars

Response data shape:

```ts
type CreateLobbyResponseDto = {
  lobby: LobbyDetailApiDto;
};
```

## GET `/api/lobbies/:lobbyId`

Returns one lobby that the current user can access.

Response data shape:

```ts
type LobbyDetailApiDto = {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  createdById: string;
  role: "OWNER" | "MEMBER";
  status: "ACTIVE" | "LEFT";
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    userId: string;
    role: "OWNER" | "MEMBER";
    status: "ACTIVE" | "LEFT";
    joinedAt: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  }>;
};
```

## PATCH `/api/lobbies/:lobbyId`

Updates a lobby. Only the lobby owner can update it.

Request body:

```ts
type UpdateLobbyRequestDto = {
  name?: string;
  description?: string | null;
};
```

Validation:

- At least one field is required
- `name`: if sent, trimmed, 1-80 chars
- `description`: if sent, trimmed, max 240 chars, empty string is normalized to `null`

Common error cases:

- `401`: user is not authenticated
- `403`: current member is not the owner
- `404`: lobby not found or not accessible
- `422`: request validation failed

## Frontend helper

If the frontend is inside this repo, it can use the ready-made fetch wrapper:

```ts
import {
  createLobby,
  getLobby,
  listLobbies,
  updateLobby,
} from "@/lib/api/lobbies";

const lobbies = await listLobbies();
const created = await createLobby({ name: "Trip Fund", description: "Summer trip" });
const detail = await getLobby(created.id);
const updated = await updateLobby(created.id, { name: "Trip Fund 2026" });
```

These helpers already:

- unwrap the shared `ApiResponse<T>` envelope
- throw `ApiClientError` on non-success responses
- return frontend-safe DTOs with ISO date strings
