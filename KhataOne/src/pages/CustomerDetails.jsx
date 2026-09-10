import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CircleAlert,
  CreditCard,
  IndianRupee,
  Phone,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useApp } from "../context/useApp.js";

import { byId } from "../utils/helpers.js";

import {
  money,
} from "../utils/calculations.js";

export default function CustomerDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    customers,
    reminder,
    deleteCustomer,
  } = useApp();

  const customer = byId(
    customers,
    id,
  );

  if (!customer) {
    return (
      <div className="rounded-2xl border border-[#e5ddd8] bg-white p-8 text-center">
        <h2 className="text-lg font-bold">
          Customer not found
        </h2>

        <button
          onClick={() =>
            navigate("/customers")
          }
          className="mt-4 rounded-lg bg-[#8f2039] px-4 py-2 text-xs font-bold text-white"
        >
          Back to customers
        </button>
      </div>
    );
  }

  const transactions =
    customer.own || [];

  const outstanding = Number(
    customer.outstanding || 0,
  );

  const credit = Number(
    customer.credit || 0,
  );

  const payments = Number(
    customer.payments || 0,
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      Number(customer.score || 0),
    ),
  );

  /* REMINDER */
  const handleReminder = async () => {
    const success =
      await reminder(customer);

    if (success) {
      navigate("/collections");
    }
  };

  /* DELETE */
  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        `Delete ${customer.name}? This action cannot be undone.`,
      );

    if (!confirmed) return;

    const success =
      await deleteCustomer(
        customer.id,
      );

    if (success) {
      navigate("/customers");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 pb-8">

      {/* BACK */}
      <button
        onClick={() =>
          navigate("/customers")
        }
        className="flex items-center gap-2 text-xs font-semibold text-[#8f2039] transition hover:gap-3"
      >
        <ArrowLeft size={15} />
        All customers
      </button>

      {/* CUSTOMER HEADER */}
      <section className="rounded-[20px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-[0_5px_18px_rgba(73,48,35,.05)] dark:border-[#423238] dark:bg-[#2b2226] sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* PROFILE */}
          <div className="flex min-w-0 items-center gap-4">

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#f3e9eb] text-lg font-bold text-[#8f2039]">
              {getInitials(
                customer.name,
              )}
            </div>

            <div className="min-w-0">

              <h1 className="truncate text-[23px] font-bold text-[#20243a] dark:text-white">
                {customer.name}
              </h1>

              <p className="mt-1 flex items-center gap-1.5 text-xs text-[#777176]">
                <Phone size={13} />
                {customer.phone ||
                  "Phone not added"}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                    customer.color ===
                    "red"
                      ? "bg-[#fde9eb] text-[#c33448]"
                      : customer.color ===
                          "amber"
                        ? "bg-[#fff3d8] text-[#b98519]"
                        : "bg-[#e8f4ed] text-[#37815f]"
                  }`}
                >
                  ●{" "}
                  {customer.status ||
                    "Reliable"}
                </span>

                {customer.category && (
                  <span className="rounded-full border border-[#ded7d2] bg-white px-2.5 py-1 text-[9px] text-[#6e6768]">
                    {customer.category}
                  </span>
                )}

              </div>
            </div>
          </div>

          {/* MONEY */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <div className="text-left sm:text-right">

              <span className="block text-[10px] text-[#82787b]">
                Outstanding
              </span>

              <strong className="block text-[22px] font-bold text-[#342c2f] dark:text-white">
                {money(outstanding)}
              </strong>

              <span className="text-[10px] text-[#82787b]">
                Credit limit{" "}
                {money(
                  customer.creditLimit ||
                    0,
                )}
              </span>

            </div>

            <div className="flex flex-wrap gap-2">

              {/* REMIND */}
              <button
                onClick={
                  handleReminder
                }
                disabled={
                  outstanding <= 0
                }
                className="flex items-center justify-center gap-2 rounded-[9px] bg-[#8f2039] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#741b30] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Bell size={15} />
                Remind
              </button>

              {/* PAYMENT */}
              <button
                onClick={() =>
                  navigate(
                    `/transactions?customer=${customer.id}`,
                  )
                }
                className="flex items-center justify-center gap-2 rounded-[9px] border border-[#ddd5d0] bg-white px-5 py-2.5 text-xs font-semibold text-[#40393b] shadow-sm transition hover:border-[#8f2039] hover:text-[#8f2039] active:scale-95"
              >
                <CreditCard
                  size={15}
                />
                Payment
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* OVERDUE ALERT */}
      {customer.overdue?.length >
        0 && (
        <section className="rounded-[18px] border border-[#f1b9bd] bg-[#fff3f1] p-5">

          <div className="flex gap-3">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f9dce0] text-[#c33448]">
              <CircleAlert
                size={18}
              />
            </div>

            <div>

              <h2 className="text-sm font-bold text-[#c33448]">
                High risk customer
              </h2>

              <p className="mt-1 text-xs text-[#786f72]">
                Outstanding{" "}
                {money(
                  outstanding,
                )}{" "}
                ·{" "}
                {
                  customer.overdue
                    .length
                }{" "}
                overdue transaction
                {customer.overdue
                  .length > 1
                  ? "s"
                  : ""}
              </p>

            </div>
          </div>
        </section>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <InfoCard
          icon={WalletCards}
          label="Outstanding"
          value={money(
            outstanding,
          )}
          tone="red"
        />

        <InfoCard
          icon={IndianRupee}
          label="Total credit"
          value={money(credit)}
          tone="burgundy"
        />

        <InfoCard
          icon={CreditCard}
          label="Payments"
          value={money(payments)}
          tone="green"
        />

        <InfoCard
          icon={ShieldCheck}
          label="Trust score"
          value={`${score}/100`}
          tone="blue"
        />

      </div>

      {/* TRUST SCORE + PERSONALITY */}
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">

        <section className="rounded-[18px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">

          <h2 className="text-[16px] font-bold text-[#292326] dark:text-white">
            Trust Score
          </h2>

          <div className="mt-5 flex items-center gap-5">

            <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full border-[8px] border-[#f0dfe2]">

              <div className="text-center">
                <strong className="block text-[22px] font-bold text-[#8f2039]">
                  {score}
                </strong>

                <span className="text-[8px] text-[#888083]">
                  / 100
                </span>
              </div>

            </div>

            <div>

              <p className="text-sm font-bold text-[#393337] dark:text-white">
                {customer.status ||
                  "Customer"}
              </p>

              <p className="mt-1 text-[10px] leading-5 text-[#858083]">
                Score based on payment
                history and outstanding
                balance.
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            <Metric
              label="Payment history"
              value={
                credit > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (payments /
                          credit) *
                          100,
                      ),
                    )
                  : 0
              }
            />

            <Metric
              label="Collection"
              value={
                credit > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (payments /
                          credit) *
                          100,
                      ),
                    )
                  : 0
              }
            />

            <Metric
              label="Risk level"
              value={
                score
              }
            />

          </div>
        </section>

        <section className="rounded-[18px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">

          <h2 className="text-[16px] font-bold text-[#292326] dark:text-white">
            Payment Personality
          </h2>

          <p className="mt-1 text-[11px] text-[#858083]">
            Based on this customer's
            transaction behaviour.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <Personality
              title="Payment behaviour"
              value={
                payments >= credit
                  ? "Excellent"
                  : payments >
                      credit * 0.7
                    ? "Good"
                    : payments >
                        credit * 0.4
                      ? "Average"
                      : "Needs attention"
              }
            />

            <Personality
              title="Current risk"
              value={
                score < 50
                  ? "High"
                  : score < 75
                    ? "Medium"
                    : "Low"
              }
            />

            <Personality
              title="Pending amount"
              value={money(
                outstanding,
              )}
            />

            <Personality
              title="Transactions"
              value={
                transactions.length
              }
            />

          </div>

        </section>
      </div>

      {/* TIMELINE */}
      <section className="rounded-[18px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226] sm:p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-[17px] font-bold text-[#20243a] dark:text-white">
              Transaction timeline
            </h2>

            <p className="mt-1 text-[11px] text-[#858083]">
              {transactions.length}{" "}
              transaction
              {transactions.length !==
              1
                ? "s"
                : ""}
            </p>

          </div>

          <CalendarDays
            size={19}
            className="text-[#8f2039]"
          />

        </div>

        <div className="mt-5 divide-y divide-[#eee7e2]">

          {transactions.length ===
          0 ? (
            <div className="py-10 text-center text-xs text-[#8a8384]">
              No transactions yet.
            </div>
          ) : (
            transactions.map(
              (item) => {
                const isPayment =
                  String(
                    item.type ||
                      "",
                  ).toLowerCase() ===
                  "payment";

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-4"
                  >

                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        isPayment
                          ? "bg-[#e8f5ed] text-[#37815f]"
                          : "bg-[#f9e7e9] text-[#8f2039]"
                      }`}
                    >
                      {isPayment ? (
                        <CreditCard
                          size={16}
                        />
                      ) : (
                        <WalletCards
                          size={16}
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">

                      <strong className="block text-xs font-bold capitalize text-[#393337] dark:text-white">
                        {isPayment
                          ? "Payment received"
                          : "Credit given"}
                      </strong>

                      <span className="mt-1 block text-[10px] text-[#888083]">
                        {item.date ||
                          "Date unavailable"}

                        {item.method
                          ? ` · ${item.method}`
                          : ""}

                        {item.dueDate
                          ? ` · Due ${item.dueDate}`
                          : ""}
                      </span>

                    </div>

                    <strong
                      className={`shrink-0 text-sm ${
                        isPayment
                          ? "text-[#37815f]"
                          : "text-[#8f2039]"
                      }`}
                    >
                      {isPayment
                        ? "-"
                        : "+"}

                      {money(
                        item.amount,
                      )}
                    </strong>

                  </div>
                );
              },
            )
          )}

        </div>
      </section>

      {/* DELETE */}
      <div className="flex justify-end">

        <button
          onClick={
            handleDelete
          }
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#bf6873] transition hover:bg-[#fff0f1]"
        >
          <Trash2 size={14} />
          Delete customer
        </button>

      </div>

    </div>
  );
}

/* INFO CARD */
function InfoCard({
  icon: Icon,
  label,
  value,
  tone,
}) {
  const styles = {
    red:
      "bg-[#faeded] text-[#c65b62]",
    burgundy:
      "bg-[#f8ecef] text-[#8f2039]",
    green:
      "bg-[#e9f5ee] text-[#3f8b68]",
    blue:
      "bg-[#eaf1f5] text-[#55758c]",
  };

  return (
    <article className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-4 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">

      <div className="flex items-center justify-between gap-2">

        <span className="text-[10px] font-medium text-[#81797b]">
          {label}
        </span>

        <span
          className={`grid h-8 w-8 place-items-center rounded-full ${styles[tone]}`}
        >
          <Icon size={15} />
        </span>

      </div>

      <strong className="mt-3 block text-[21px] font-bold text-[#292326] dark:text-white">
        {value}
      </strong>

    </article>
  );
}

/* METRIC */
function Metric({
  label,
  value,
}) {
  const safeValue = Math.max(
    0,
    Math.min(
      100,
      Number(value) || 0,
    ),
  );

  return (
    <div>

      <div className="mb-1.5 flex justify-between text-[9px] font-medium text-[#777176]">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#eee7e3]">

        <div
          className="h-full rounded-full bg-[#8f2039] transition-all duration-500"
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

/* PERSONALITY */
function Personality({
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#ebe3df] bg-[#faf7f5] p-4">

      <span className="text-[9px] text-[#888083]">
        {title}
      </span>

      <strong className="mt-1 block text-sm font-bold text-[#393337]">
        {value}
      </strong>

    </div>
  );
}

/* INITIALS */
function getInitials(
  name = "",
) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map(
      (item) => item[0],
    )
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "CU";
}