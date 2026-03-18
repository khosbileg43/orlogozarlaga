import { TransactionType } from "./types";

export function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

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
  if (type === "TRANSFER") {
    return `↔ ${formatYen(amount)}`;
  }
  const sign = type === "EXPENSE" ? "-" : "+";
  return `${sign}${formatYen(amount)}`;
}

export function formatIsoDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${month}/${day}/${year}`;
}
