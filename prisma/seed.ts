import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed a reusable user record. When the same email later signs in via Auth0,
  // the repository binds the incoming Auth0 subject onto this local user row.
  const user = await prisma.user.upsert({
    where: { email: "demo@user.com" },
    update: { name: "Demo User" },
    create: { email: "demo@user.com", name: "Demo User" },
  });

  // Create accounts (Cash / Yuuchou / Mongol Bank)
  const accountNames = ["Cash", "Yuuchou ginkou", "Mongol Bank"];

  const accounts = [];
  for (const name of accountNames) {
    const acc = await prisma.account.upsert({
      where: { id: `${user.id}-${name}` }, // simple deterministic id trick
      update: {},
      create: {
        id: `${user.id}-${name}`,
        userId: user.id,
        name,
        balance: 1_000_000,
      },
    });
    accounts.push(acc);
  }

  // Add a few transactions (example like screenshot)
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: accounts[0].id,
        type: "INCOME",
        category: "Salary",
        amount: 1_000_000,
        description: "Salary",
        date: new Date("2026-02-15"),
      },
      {
        userId: user.id,
        accountId: accounts[0].id,
        type: "EXPENSE",
        category: "Food",
        amount: 10_000,
        description: "Food",
        date: new Date("2026-02-15"),
      },
      {
        userId: user.id,
        accountId: accounts[0].id,
        type: "EXPENSE",
        category: "Transportation",
        amount: 100_000,
        description: "Transportation",
        date: new Date("2026-02-16"),
      },
      {
        userId: user.id,
        accountId: accounts[0].id,
        toAccountId: accounts[1].id,
        type: "TRANSFER",
        category: "Between accounts",
        amount: 50_000,
        description: "Move to Yuuchou",
        date: new Date("2026-02-17"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded ✅", {
    userId: user.id,
    seededEmail: user.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
