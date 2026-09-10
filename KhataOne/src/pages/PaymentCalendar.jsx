import { useMemo, useState } from "react";
import { useApp } from "../context/useApp.js";
import { dateKey } from "../utils/dateHelpers.js";
import { money } from "../utils/calculations.js";

export default function PaymentCalendar() {
  const { data, customers } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  const month = currentDate.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const payments = useMemo(
    () => data.transactions.filter((item) => item.dueDate),
    [data.transactions],
  );

  const customerName = (id) =>
    customers.find((item) => item.id === id)?.name || "Customer";

  const changeMonth = (value) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + value, 1),
    );
  };

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const previousMonthDays = new Date(year, monthIndex, 0).getDate();

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - firstDay + 1;

    if (dayNumber <= 0) {
      const date = new Date(
        year,
        monthIndex - 1,
        previousMonthDays + dayNumber,
      );
      return { date, muted: true };
    }

    if (dayNumber > daysInMonth) {
      const date = new Date(year, monthIndex + 1, dayNumber - daysInMonth);
      return { date, muted: true };
    }

    return {
      date: new Date(year, monthIndex, dayNumber),
      muted: false,
    };
  });

  const totalExpected = payments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const received = payments.filter(
    (item) => item.type === "payment",
  ).length;

  const pending = payments.filter(
    (item) => item.type !== "payment",
  ).length;

  const upcoming = [...payments]
    .filter((item) => item.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[0.28em] text-[#7b2430]">
            PAYMENT SCHEDULE
          </p>

          <h1 className="font-serif text-4xl font-bold leading-tight text-[#27232a] sm:text-5xl">
            Payment Calendar
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-[#716a6d] sm:text-base">
            Stay on top of your receivables. See when your customers are
            expected to pay.
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button className="flex-1 rounded-xl bg-[#7b1f2a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#641722] sm:flex-none">
            ＋ Add Payment
          </button>

          <button className="flex-1 rounded-xl border border-[#ded8d4] bg-white px-4 py-3 text-sm font-medium text-[#423b3d] sm:flex-none">
            ⚙ Calendar Settings
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-xl border border-[#ded8d4] bg-white px-4 py-2.5 text-lg"
          >
            ‹
          </button>

          <div className="flex items-center rounded-xl border border-[#ded8d4] bg-white px-4 py-2.5 text-sm font-semibold">
            {month}
          </div>

          <button
            onClick={() => changeMonth(1)}
            className="rounded-xl border border-[#ded8d4] bg-white px-4 py-2.5 text-lg"
          >
            ›
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border border-[#ded8d4] bg-white px-4 py-2.5 text-sm"
          >
            Today
          </button>
        </div>

        <div className="flex overflow-hidden rounded-xl border border-[#ded8d4] bg-white">
          {["month", "week", "list"].map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`px-4 py-2.5 text-sm capitalize transition ${
                view === item
                  ? "bg-[#7b1f2a] font-semibold text-white"
                  : "text-[#625b5d]"
              }`}
            >
              {item === "month" ? "▣ Month" : item === "week" ? "◷ Week" : "☷ List"}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        {/* LEFT */}
        <div className="min-w-0">
          {/* CALENDAR */}
          <div className="overflow-hidden rounded-2xl border border-[#ddd7d2] bg-white shadow-sm">
            <div className="grid grid-cols-7 border-b border-[#e5dfda]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className={`py-3 text-center text-[10px] font-semibold sm:text-xs ${
                      day === "Sun"
                        ? "text-[#a52a37]"
                        : "text-[#514a4c]"
                    }`}
                  >
                    {day}
                  </div>
                ),
              )}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map(({ date, muted }, index) => {
                const key = dateKey(date);
                const entries = payments.filter(
                  (item) => item.dueDate === key,
                );

                return (
                  <div
                    key={index}
                    className={`min-h-[72px] border-b border-r border-[#ebe6e1] p-1.5 sm:min-h-[105px] sm:p-2 ${
                      muted ? "bg-[#faf9f7]" : "bg-white"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium sm:text-xs ${
                        muted ? "text-[#b7b0ac]" : "text-[#423b3d]"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <div className="mt-1 space-y-1">
                      {entries.slice(0, 1).map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-lg px-1.5 py-1 text-[8px] sm:px-2 sm:py-2 sm:text-[10px] ${
                            item.type === "payment"
                              ? "bg-[#e4f0e9] text-[#39765a]"
                              : "bg-[#f9e8e7] text-[#8c2733]"
                          }`}
                        >
                          <p className="truncate font-semibold">
                            {customerName(item.customerId)}
                          </p>
                          <p className="font-bold">
                            {money(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEGEND */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-[#e0dad5] bg-white px-4 py-3 text-xs text-[#645d60]">
            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-[#4d9673]" />
              Received
            </span>

            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-[#df9b36]" />
              Due Soon
            </span>

            <span className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-[#d94b5b]" />
              Overdue / Pending
            </span>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {/* OVERVIEW */}
          <div className="rounded-2xl border border-[#ddd7d2] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#302a2c]">
                This Month Overview
              </h2>
              <span className="text-xs text-[#7d7577]">{month}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatBox
                icon="▣"
                value={payments.length}
                label="Total Payments"
              />

              <StatBox
                icon="₹"
                value={money(totalExpected)}
                label="Expected Amount"
              />

              <StatBox icon="⊗" value={pending} label="Pending" />

              <StatBox icon="✓" value={received} label="Received" />
            </div>
          </div>

          {/* UPCOMING */}
          <div className="rounded-2xl border border-[#ddd7d2] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#302a2c]">
                Upcoming Payments
              </h2>

              <button className="text-sm font-medium text-[#7b1f2a]">
                View All →
              </button>
            </div>

            <div className="divide-y divide-[#eee9e5]">
              {upcoming.length ? (
                upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-[#827a7d]">
                        {item.dueDate}
                      </p>
                      <p className="truncate text-sm font-medium">
                        {customerName(item.customerId)}
                      </p>
                    </div>

                    <strong className="whitespace-nowrap text-sm">
                      {money(item.amount)}
                    </strong>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-[#938b8d]">
                  No upcoming payments
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div className="rounded-xl bg-[#faf8f6] p-3 sm:p-4">
      <div className="mb-2 text-sm text-[#7b1f2a]">{icon}</div>
      <strong className="block text-lg text-[#332d2f] sm:text-xl">
        {value}
      </strong>
      <span className="mt-1 block text-[10px] text-[#827a7d] sm:text-xs">
        {label}
      </span>
    </div>
  );
}