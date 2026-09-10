import { dateKey } from "./dateHelpers.js";

export const money = (value, currency = "₹") =>
  `${currency}${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const amount = (value) => Math.max(0, Number(value) || 0);

const getDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isCredit = (item) => String(item?.type || "").toLowerCase() === "credit";
const isPayment = (item) =>
  String(item?.type || "").toLowerCase() === "payment";

export function customerStats(customer, transactions = []) {
  const own = transactions
    .filter((item) => item?.customerId === customer?.id)
    .sort((a, b) => {
      const da = getDate(a.date)?.getTime() || 0;
      const db = getDate(b.date)?.getTime() || 0;
      return da - db;
    });

  const credit = own
    .filter(isCredit)
    .reduce((sum, item) => sum + amount(item.amount), 0);

  const payments = own
    .filter(isPayment)
    .reduce((sum, item) => sum + amount(item.amount), 0);

  const openingBalance = amount(customer?.openingBalance);

  const outstanding = Math.max(
    0,
    openingBalance + credit - payments,
  );

  /* Allocate payments against old credits so paid credits
     don't remain marked as overdue. */
  let remainingPayments = payments;

  const creditRows = own
    .filter(isCredit)
    .map((item) => ({
      ...item,
      remaining: amount(item.amount),
    }));

  creditRows.forEach((item) => {
    const used = Math.min(item.remaining, remainingPayments);
    item.remaining -= used;
    remainingPayments -= used;
  });

  const today = dateKey();

  const overdue = creditRows.filter(
    (item) =>
      item.remaining > 0 &&
      item.dueDate &&
      String(item.dueDate) < today,
  );

  const overdueAmount = overdue.reduce(
    (sum, item) => sum + item.remaining,
    0,
  );

  const creditLimit = amount(customer?.creditLimit);

  const overduePenalty =
    credit > 0
      ? Math.min(35, (overdueAmount / credit) * 35)
      : 0;

  const utilizationPenalty =
    creditLimit > 0
      ? Math.min(25, (outstanding / creditLimit) * 25)
      : outstanding > 0
        ? 10
        : 0;

  const paymentRate =
    credit > 0
      ? Math.min(100, (payments / credit) * 100)
      : 100;

  const score = Math.max(
    15,
    Math.min(
      98,
      Math.round(
        55 +
          paymentRate * 0.35 -
          overduePenalty -
          utilizationPenalty,
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
    overdueAmount,
    score,
    status:
      score > 75
        ? "Reliable"
        : score > 50
          ? "Reminder needed"
          : "High risk",
    color:
      score > 75
        ? "green"
        : score > 50
          ? "amber"
          : "red",
  };
}

export function metrics(transactions = [], range = "month") {
  const now = new Date();
  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    start.setDate(now.getDate() - 7);
  } else if (range === "last") {
    start.setMonth(now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  const credits = transactions
    .filter(isCredit)
    .reduce((sum, item) => sum + amount(item.amount), 0);

  const payments = transactions
    .filter(isPayment)
    .reduce((sum, item) => sum + amount(item.amount), 0);

  const collected = transactions
    .filter((item) => {
      const date = getDate(item.date);
      return isPayment(item) && date && date >= start;
    })
    .reduce((sum, item) => sum + amount(item.amount), 0);

  /* Calculate remaining balance on each credit transaction. */
  let remainingPayments = payments;

  const creditRows = transactions
    .filter(isCredit)
    .map((item) => ({
      ...item,
      remaining: amount(item.amount),
    }))
    .sort(
      (a, b) =>
        (getDate(a.date)?.getTime() || 0) -
        (getDate(b.date)?.getTime() || 0),
    );

  creditRows.forEach((item) => {
    const used = Math.min(item.remaining, remainingPayments);
    item.remaining -= used;
    remainingPayments -= used;
  });

  const overdue = creditRows
    .filter(
      (item) =>
        item.remaining > 0 &&
        item.dueDate &&
        String(item.dueDate) < dateKey(),
    )
    .reduce((sum, item) => sum + item.remaining, 0);

  const receivable = Math.max(0, credits - payments);

  const collectionRate =
    credits > 0
      ? Math.min(100, (payments / credits) * 100)
      : 0;

  const health = receivable === 0
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          Math.round(
            collectionRate * 0.7 +
              (overdue === 0 ? 30 : 15),
          ),
        ),
      );

  return {
    receivable,
    pending: receivable,
    collected,
    overdue,
    health,
  };
}