export function getMonthRange(month: string) {
  // month = "2026-02"
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) throw new Error("Invalid month format. Use YYYY-MM.");

  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1)); // next month
  return { start, end };
}
