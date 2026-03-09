export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export type DashboardAccount = {
  id: string;
  name: string;
  balance: number;
};

export type DashboardSummaryItem = {
  category: string;
  amount: number;
};

export type DashboardTransaction = {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
};

const transactions: DashboardTransaction[] = [
  {
    id: "tx-1",
    type: "INCOME",
    category: "Salary",
    description: "Monthly salary",
    amount: 1_000_000,
    date: "2026-02-01",
  },
  {
    id: "tx-2",
    type: "EXPENSE",
    category: "Food",
    description: "Groceries",
    amount: 28_000,
    date: "2026-02-03",
  },
  {
    id: "tx-3",
    type: "EXPENSE",
    category: "Transportation",
    description: "Train pass",
    amount: 32_000,
    date: "2026-02-05",
  },
  {
    id: "tx-4",
    type: "INCOME",
    category: "Freelance",
    description: "Design project",
    amount: 180_000,
    date: "2026-02-09",
  },
  {
    id: "tx-5",
    type: "EXPENSE",
    category: "Shopping",
    description: "Clothes",
    amount: 75_000,
    date: "2026-02-12",
  },
  {
    id: "tx-6",
    type: "EXPENSE",
    category: "Food",
    description: "Dinner",
    amount: 14_000,
    date: "2026-02-16",
  },
  {
    id: "tx-7",
    type: "INCOME",
    category: "Bonus",
    description: "Performance bonus",
    amount: 150_000,
    date: "2026-02-20",
  },
  {
    id: "tx-8",
    type: "EXPENSE",
    category: "Transportation",
    description: "Taxi",
    amount: 18_000,
    date: "2026-02-23",
  },
];

const options = {
  incomeCategories: ["Salary", "Freelance", "Bonus", "Gift", "Other"],
  expenseCategories: [
    "Food",
    "Transportation",
    "Shopping",
    "Home",
    "Hobby",
    "Other",
  ],
};

function toMonthKey(date: string) {
  return date.slice(0, 7);
}

function sumByCategory(
  categories: string[],
  type: TransactionType,
  list: DashboardTransaction[],
) {
  return categories.map((category) => ({
    category,
    amount: list
      .filter((tx) => tx.type === type && tx.category === category)
      .reduce((sum, tx) => sum + tx.amount, 0),
  }));
}

export function getSummaryByMonth(month: string) {
  const monthlyTransactions = transactions.filter(
    (transaction) => toMonthKey(transaction.date) === month,
  );

  const incomeByCategory = sumByCategory(
    options.incomeCategories,
    "INCOME",
    monthlyTransactions,
  );
  const expenseByCategory = sumByCategory(
    options.expenseCategories,
    "EXPENSE",
    monthlyTransactions,
  );

  const incomeTotal = incomeByCategory.reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = expenseByCategory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return {
    incomeTotal,
    expenseTotal,
    incomeByCategory,
    expenseByCategory,
  };
}

const sortedMonths = Array.from(new Set(transactions.map((tx) => toMonthKey(tx.date)))).sort();
const defaultMonth = sortedMonths[sortedMonths.length - 1] ?? "2026-02";
const defaultSummary = getSummaryByMonth(defaultMonth);

export const dashboardTestData = {
  user: {
    name: "Demo User",
  },
  defaultMonth,
  accounts: [
    { id: "acc-cash", name: "Cash", balance: 1_200_000 },
    { id: "acc-yuucho", name: "Yuuchou ginkou", balance: 980_000 },
    { id: "acc-mongol", name: "Mongol Bank", balance: 820_000 },
  ] as DashboardAccount[],
  summary: defaultSummary as {
    incomeTotal: number;
    expenseTotal: number;
    incomeByCategory: DashboardSummaryItem[];
    expenseByCategory: DashboardSummaryItem[];
  },
  transactions: transactions as DashboardTransaction[],
  options,
};

export function formatMonthLabel(month: string) {
  const [year, mon] = month.split("-");
  const y = Number(year);
  const m = Number(mon);
  if (Number.isNaN(y) || Number.isNaN(m)) return month;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function shiftMonth(month: string, delta: number) {
  const [year, mon] = month.split("-");
  const y = Number(year);
  const m = Number(mon);
  if (Number.isNaN(y) || Number.isNaN(m)) return month;

  const next = new Date(Date.UTC(y, m - 1 + delta, 1));
  const nextYear = next.getUTCFullYear();
  const nextMonth = String(next.getUTCMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function formatYen(amount: number) {
  return `${amount.toLocaleString("en-US")} ￥`;
}

export function formatSignedYen(type: TransactionType, amount: number) {
  const sign = type === "EXPENSE" ? "-" : "+";
  return `${sign}${formatYen(amount)}`;
}

export function formatIsoDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year}`;
}
