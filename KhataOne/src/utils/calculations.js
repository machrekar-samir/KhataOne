import { dateKey } from "./dateHelpers.js";
export const money = (value, currency = "₹") =>
  `${currency}${Math.round(value || 0).toLocaleString("en-IN")}`;
export function customerStats(customer, transactions) {
  const own = transactions.filter((item) => item.customerId === customer.id);
  const credit = own
    .filter((item) => item.type === "credit")
    .reduce((sum, item) => sum + +item.amount, 0);
  const payments = own
    .filter((item) => item.type === "payment")
    .reduce((sum, item) => sum + +item.amount, 0);
  const outstanding = Math.max(0, credit - payments);
  const overdue = own.filter(
    (item) =>
      item.type === "credit" &&
      item.dueDate &&
      item.dueDate < dateKey() &&
      outstanding > 0,
  );
  const score = Math.max(
    15,
    Math.min(
      98,
      Math.round(
        92 -
          overdue.length * 18 -
          (outstanding / Math.max(1, customer.creditLimit)) * 20,
      ),
    ),
  );
  return {
    ...customer,
    own,
    credit,
    payments,
    outstanding,
    overdue,
    score,
    status:
      score > 75 ? "Reliable" : score > 50 ? "Reminder needed" : "High risk",
    color: score > 75 ? "green" : score > 50 ? "amber" : "red",
  };
}
export function metrics(transactions, range = "month") {
  const now = new Date();
  const start = new Date(now);
  if (range === "today") start.setHours(0, 0, 0, 0);
  else if (range === "week") start.setDate(now.getDate() - 7);
  else if (range === "last") start.setMonth(now.getMonth() - 1, 1);
  else start.setMonth(now.getMonth(), 1);
  const credits = transactions
    .filter((item) => item.type === "credit")
    .reduce((sum, item) => sum + +item.amount, 0);
  const payments = transactions
    .filter((item) => item.type === "payment")
    .reduce((sum, item) => sum + +item.amount, 0);
  const collected = transactions
    .filter((item) => item.type === "payment" && new Date(item.date) >= start)
    .reduce((sum, item) => sum + +item.amount, 0);
  const overdue = transactions
    .filter(
      (item) =>
        item.type === "credit" && item.dueDate && item.dueDate < dateKey(),
    )
    .reduce((sum, item) => sum + +item.amount, 0);
  return {
    receivable: Math.max(0, credits - payments),
    pending: Math.max(0, credits - payments),
    collected,
    overdue,
    health: Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (payments / Math.max(1, credits)) * 70 + (overdue ? 12 : 30),
        ),
      ),
    ),
  };
}
