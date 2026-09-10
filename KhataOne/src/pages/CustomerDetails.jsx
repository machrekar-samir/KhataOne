import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  Clock3,
  Link2,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  UserRound,
  Wallet,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { byId } from "../utils/helpers.js";
import { money } from "../utils/calculations.js";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, customers, reminder, deleteCustomer } = useApp();

  const customer = byId(customers, id);

  const transactions = useMemo(
    () => customer?.own || [],
    [customer],
  );

  if (!customer) {
    return (
      <div className="rounded-2xl border border-[#e4ddd5] bg-[#fffdf9] p-8 text-center text-sm text-[#766d70]">
        Customer not found.
      </div>
    );
  }

  const outstanding = Number(
    customer.outstanding ||
      customer.balance ||
      customer.pendingAmount ||
      0,
  );

  const credit = Number(customer.credit || 0);
  const payments = Number(customer.payments || 0);

  const score = Number.isFinite(Number(customer.score))
    ? Math.max(0, Math.min(100, Number(customer.score)))
    : 50;

  const phone =
    customer.phone ||
    customer.mobile ||
    customer.phoneNumber ||
    "";

  const category =
    customer.category ||
    customer.type ||
    customer.segment ||
    "Customer";

  const creditLimit = Number(
    customer.creditLimit || customer.limit || 0,
  );

  const status =
    score < 40
      ? "High risk"
      : score < 70
        ? "Medium risk"
        : "Low risk";

  const overdueDays = Number(
    customer.daysOverdue ||
      customer.overdueDays ||
      0,
  );

  const paymentConsistency = Math.max(
    0,
    Math.min(100, score + (payments > 0 ? 8 : -8)),
  );

  const averageDelay = Math.max(
    0,
    Math.min(
      100,
      overdueDays > 0 ? Math.max(5, 100 - overdueDays) : 95,
    ),
  );

  const reminderDependency = Math.max(
    0,
    Math.min(
      100,
      Number(customer.reminderDependency || 25),
    ),
  );

  const overdueExposure = Math.max(
    0,
    Math.min(
      100,
      outstanding > 0
        ? Math.round(
            (outstanding / Math.max(credit || outstanding, outstanding)) *
              100,
          )
        : 0,
    ),
  );

  const lastTransaction = transactions.length
    ? transactions[transactions.length - 1]
    : null;

  const lastDate = lastTransaction?.date
    ? formatDate(lastTransaction.date)
    : "No payment recorded";

  const riskReasons = [
    outstanding > 0 && "Large pending balance",
    overdueDays > 0 && "Overdue transaction",
    score < 50 && "Payment behavior declining",
  ].filter(Boolean);

  const recommendation =
    score < 40
      ? `High risk. Avoid extending additional credit. ${
          creditLimit
            ? `Recommended maximum additional credit: ${money(
                Math.max(0, creditLimit - outstanding),
              )}.`
            : "Consider limiting additional credit."
        }`
      : score < 70
        ? "Medium risk. Follow up before extending additional credit."
        : "Low risk. Customer shows a healthy payment pattern.";

  const handleDelete = async () => {
    const ok = window.confirm(
      `Delete ${customer.name}? This action cannot be undone.`,
    );

    if (!ok) return;

    await deleteCustomer(customer.id);
    navigate("/customers");
  };

  return (
    <div className="w-full space-y-5 pb-8">

      {/* BACK */}
      <button
        onClick={() => navigate("/customers")}
        className="flex items-center gap-2 text-[12px] font-medium text-[#7a2633] transition hover:gap-3"
      >
        <ArrowLeft size={15} />
        All customers
      </button>

      {/* CUSTOMER HEADER */}
      <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] px-5 py-5 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex min-w-0 items-center gap-4">

            {/* AVATAR */}
            <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full bg-[#f0e7e8] text-[18px] font-bold text-[#7a2633]">
              {getInitials(customer.name)}
            </div>

            {/* NAME */}
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-bold tracking-tight text-[#342c2f] dark:text-white sm:text-[24px]">
                {customer.name}
              </h1>

              <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#766d70]">
                <Phone size={13} />
                {phone || "Phone not added"}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                    score < 40
                      ? "bg-[#f9e7e9] text-[#b83f4e]"
                      : score < 70
                        ? "bg-[#fff1d8] text-[#a47716]"
                        : "bg-[#e8f3ec] text-[#3f8062]"
                  }`}
                >
                  <span className="mr-1">●</span>
                  {status}
                </span>

                <span className="rounded-full border border-[#e2d9d4] bg-white px-2.5 py-1 text-[9px] font-medium text-[#5f5559]">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* MONEY + ACTIONS */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="text-left sm:text-right">
              <span className="block text-[10px] text-[#82787b]">
                Outstanding
              </span>

              <strong className="block text-[21px] font-bold text-[#342c2f] dark:text-white">
                {money(outstanding)}
              </strong>

              <span className="text-[10px] text-[#82787b]">
                Credit limit {money(creditLimit)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => reminder(customer)}
                className="flex items-center justify-center gap-2 rounded-[11px] bg-[#7a2633] px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#621d29] hover:shadow-md active:scale-95"
              >
                <Bell size={14} />
                Remind
              </button>

              <button
                onClick={() =>
                  onPaymentLink(customer, outstanding)
                }
                className="flex items-center justify-center gap-2 rounded-[11px] border border-[#ded5d0] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#4e4548] shadow-sm transition hover:border-[#9c6973] hover:text-[#7a2633] active:scale-95"
              >
                <Link2 size={14} />
                Payment link
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RISK ALERT */}
      <section
        className={`rounded-[20px] border px-5 py-4 ${
          score < 40
            ? "border-[#f0b8be] bg-[#fff2f1]"
            : score < 70
              ? "border-[#efd7a7] bg-[#fff9eb]"
              : "border-[#cfe3d5] bg-[#f3faf5]"
        }`}
      >
        <div className="flex items-start gap-3">

          <div
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
              score < 40
                ? "bg-[#f9dce0] text-[#c52e47]"
                : score < 70
                  ? "bg-[#ffedc7] text-[#ad7915]"
                  : "bg-[#dceee2] text-[#3f8062]"
            }`}
          >
            {score < 70 ? (
              <ShieldAlert size={16} />
            ) : (
              <ShieldCheck size={16} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className={`text-[14px] font-bold ${
                score < 40
                  ? "text-[#c52e47]"
                  : score < 70
                    ? "text-[#a47716]"
                    : "text-[#3f8062]"
              }`}
            >
              {score < 70
                ? `${status} customer`
                : "Healthy customer"}
            </h2>

            <p className="mt-1 text-[11px] text-[#766d70]">
              Outstanding {money(outstanding)}
              {lastDate !== "No payment recorded"
                ? ` · last activity ${lastDate}`
                : ""}
            </p>

            {riskReasons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2 text-[11px] text-[#554c4f]">
                {riskReasons.map((reason) => (
                  <span key={reason}>• {reason}</span>
                ))}
              </div>
            )}

            <p className="mt-3 text-[11px] font-semibold text-[#453d40]">
              AI recommendation: {recommendation}
            </p>
          </div>
        </div>
      </section>

      {/* LOWER GRID */}
      <div className="grid gap-5 xl:grid-cols-[252px_1fr]">

        {/* TRUST SCORE */}
        <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-5 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226]">

          <h2 className="text-[17px] font-bold text-[#342c2f] dark:text-white">
            Trust score
          </h2>

          {/* CIRCLE */}
          <div className="mt-2 flex flex-col items-center">

            <div
              className="grid h-[126px] w-[126px] place-items-center rounded-full"
              style={{
                background: `conic-gradient(#c92f47 ${
                  score * 3.6
                }deg, #eee8e4 ${score * 3.6}deg)`,
              }}
            >
              <div className="grid h-[102px] w-[102px] place-items-center rounded-full bg-[#fffdf9] dark:bg-[#2b2226]">
                <div className="text-center">
                  <strong className="block text-[25px] font-bold text-[#342c2f] dark:text-white">
                    {score}
                  </strong>

                  <span className="text-[10px] text-[#81777a]">
                    / 100
                  </span>
                </div>
              </div>
            </div>

            <span
              className={`mt-2 text-[12px] font-semibold ${
                score < 40
                  ? "text-[#d6314a]"
                  : score < 70
                    ? "text-[#b27b17]"
                    : "text-[#3f8062]"
              }`}
            >
              {status}
            </span>
          </div>

          {/* METRICS */}
          <div className="mt-5 space-y-3">

            <Progress
              label="Payment consistency"
              value={paymentConsistency}
            />

            <Progress
              label="Average delay"
              value={averageDelay}
            />

            <Progress
              label="Reminder dependency"
              value={reminderDependency}
            />

            <Progress
              label="Overdue exposure"
              value={overdueExposure}
            />
          </div>

          {/* RECOMMENDATION */}
          <div className="mt-5 rounded-[17px] bg-[#faf6f2] p-4 dark:bg-[#32272b]">
            <p className="text-[11px] font-bold leading-5 text-[#40383b] dark:text-white">
              {score < 40
                ? "High risk. Avoid extending additional credit."
                : score < 70
                  ? "Follow up before extending additional credit."
                  : "Customer has a healthy payment pattern."}
            </p>

            <p className="mt-1 text-[11px] leading-4 text-[#8a7e81]">
              Recommended credit limit:{" "}
              {money(
                creditLimit ||
                  Math.max(0, outstanding * (score / 100)),
              )}
            </p>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-5 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226]">

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold text-[#342c2f] dark:text-white">
              Transaction timeline
            </h2>

            <span className="text-[11px] font-medium text-[#8f2039]">
              {score}% likely to pay soon
            </span>
          </div>

          {transactions.length > 0 ? (
            <div className="mt-5 space-y-1">
              {transactions.map((item, index) => (
                <TimelineItem
                  key={item.id || index}
                  item={item}
                  last={index === transactions.length - 1}
                  currency={data?.business?.currency}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-[#ddd4cf] px-5 py-10 text-center">
              <Wallet
                size={22}
                className="mx-auto text-[#a79b9e]"
              />

              <p className="mt-2 text-[12px] font-medium text-[#71676b]">
                No transactions yet
              </p>
            </div>
          )}

          {/* PAYMENT PERSONALITY */}
          <div className="mt-5 rounded-[17px] border border-[#e5ddd7] bg-[#fffaf7] p-4 dark:border-[#493b40] dark:bg-[#32272b]">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-[#8f2039]" />

              <strong className="text-[12px] text-[#3f373a] dark:text-white">
                Payment personality
              </strong>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-[#766d70]">
              {score < 40
                ? "Payment frequency is declining and balance needs attention."
                : score < 70
                  ? "Customer sometimes delays payments and may need reminders."
                  : "Customer generally maintains a consistent payment pattern."}
            </p>

            <p className="mt-2 text-[11px] font-medium leading-5 text-[#453d40] dark:text-[#ddd1d5]">
              Best action:{" "}
              {score < 40
                ? "Follow up personally before extending more credit."
                : score < 70
                  ? "Send a reminder before the due date."
                  : "Continue the current payment relationship."}
            </p>
          </div>
        </section>
      </div>

      {/* DELETE */}
      <div className="flex justify-end">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#bf6873] transition hover:text-[#a63242]"
        >
          Delete customer
          <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Progress({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-[#766d70]">
          {label}
        </span>

        <span className="text-[10px] font-medium text-[#766d70]">
          {Math.round(value)}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#e8dfe0]">
        <div
          className="h-full rounded-full bg-[#7a2633] transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ item, last, currency }) {
  const type = String(item.type || "transaction").toLowerCase();

  const received = [
    "payment",
    "received",
    "collection",
    "income",
    "credit",
    "sale",
  ].includes(type);

  const amount = Number(item.amount || 0);

  return (
    <div className="flex gap-3">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <span
          className={`mt-1.5 h-3 w-3 rounded-full ${
            received ? "bg-[#7a2633]" : "bg-[#c92f47]"
          }`}
        />

        {!last && (
          <span className="mt-1 h-full w-px bg-[#ddd4cf]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <strong className="block text-[12px] font-semibold text-[#423a3d] dark:text-white">
              {formatTransactionType(type)}
            </strong>

            <span className="mt-1 block text-[10px] text-[#8b8184]">
              {formatDate(item.date)}
              {item.mode ? ` · ${item.mode}` : ""}
              {item.note ? ` · ${item.note}` : ""}
            </span>
          </div>

          <strong
            className={`shrink-0 text-[12px] ${
              received ? "text-[#423a3d]" : "text-[#c52e47]"
            }`}
          >
            {received ? "+" : "−"}
            {money(amount, currency)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CU"
  );
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  let date;

  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (value?.seconds) {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTransactionType(type) {
  const names = {
    credit: "Credit given",
    sale: "Credit given",
    debit: "Debit",
    payment: "Payment received",
    received: "Payment received",
    collection: "Payment received",
    income: "Payment received",
    expense: "Expense",
    payable: "Payable",
    purchase: "Purchase",
  };

  return (
    names[type] ||
    type.charAt(0).toUpperCase() + type.slice(1)
  );
}

function onPaymentLink(customer, amount) {
  const phone =
    customer.phone ||
    customer.mobile ||
    customer.phoneNumber ||
    "";

  const text = `Payment request for ${money(amount)} from ${customer.name}.`;

  if (navigator.share) {
    navigator
      .share({
        title: "KhataOne Payment Request",
        text,
      })
      .catch(() => {});
    return;
  }

  if (phone) {
    const clean = String(phone).replace(/\D/g, "");
    window.open(
      `https://wa.me/${clean}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
    return;
  }

  window.alert(text);
}