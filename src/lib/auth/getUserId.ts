import { prisma } from "@/lib/db/prisma";

export async function getUserId() {
  // TEMP: use the seeded demo user
  const user = await prisma.user.findUnique({
    where: { email: "demo@user.com" },
    select: { id: true },
  });
  if (!user) throw new Error("Demo user not found. Run seed.");
  return user.id;
}
