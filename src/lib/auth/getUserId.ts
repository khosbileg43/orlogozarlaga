import { authService } from "@/server/services/auth.service";

export async function getUserId() {
  const user = await authService.requireAuthenticatedUser();
  return user.id;
}
