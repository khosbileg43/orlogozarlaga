import { z } from "zod";

const lobbyNameSchema = z.string().trim().min(1).max(80);
const lobbyDescriptionSchema = z.string().trim().max(240);

export const lobbyIdParamSchema = z.object({
  lobbyId: z.string().min(1),
});

export const createLobbySchema = z.object({
  name: lobbyNameSchema,
  description: lobbyDescriptionSchema.nullish(),
});

export const updateLobbySchema = z
  .object({
    name: lobbyNameSchema.optional(),
    description: lobbyDescriptionSchema.nullish(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateLobbyInput = z.infer<typeof createLobbySchema>;
export type UpdateLobbyInput = z.infer<typeof updateLobbySchema>;
