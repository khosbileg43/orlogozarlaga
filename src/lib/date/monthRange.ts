export function getMonthRange(month: string) {
  // month = "2026-02"
  // Enforce strict YYYY-MM format with month between 01 and 12
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new Error("Invalid month format. Expected YYYY-MM with month between 01 and 12.");
  }

  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (Number.isNaN(y) || Number.isNaN(m)) {
    throw new Error("Invalid month format. Expected YYYY-MM with numeric year and month.");
  }
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1)); // next month
  return { start, end };
}
