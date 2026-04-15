import { z } from "zod";

export const lobbyRoleSchema = z.enum(["OWNER", "MEMBER"]);
export const lobbyMemberStatusSchema = z.enum(["ACTIVE", "LEFT"]);

export const lobbyMemberIdParamSchema = z.object({
  lobbyId: z.string().min(1),
  memberId: z.string().min(1),
});

export const createLobbyMemberSchema = z.object({
  userId: z.string().min(1),
  role: lobbyRoleSchema.default("MEMBER"),
});

export const updateLobbyMemberSchema = z
  .object({
    role: lobbyRoleSchema.optional(),
    status: lobbyMemberStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });
