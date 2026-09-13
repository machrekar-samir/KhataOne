import { Bell } from "lucide-react";

export default function MoneyStuckCard({
  groups = [],
  total = 0,
  money,
  onRemind,
}) {
  const safeMoney = (value) =>
    typeof money === "function"
      ? money(value)
      : `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const colors = [
    {
      dot: "bg-[#c83d45]",
      text: "text-[#6f6265]",
    },
    {
      dot: "bg-[#d99a27]",
      text: "text-[#6f6265]",
    },
    {
      dot: "bg-[#4d83a3]",
      text: "text-[#6f6265]",
    },
    {
      dot: "bg-[#448c6b]",
      text: "text-[#6f6265]",
    },
  ];

  const safeGroups = [
    {
      label: "Critical (30+ days)",
      amount: 0,
    },
    {
      label: "High priority (15–30 days)",
      amount: 0,
    },
    {
      label: "Due soon",
      amount: 0,
    },
    {
      label: "Recently added",
      amount: 0,
    },
  ].map((fallback, index) => ({
    ...fallback,
    ...(groups[index] || {}),
  }));

  const totalAmount = Math.max(
    0,
    Number(total || 0),
  );

  return (
    <section className="w-full overflow-hidden rounded-[22px] border border-[#ddd6d0] bg-[#fffdfb] p-4 shadow-sm dark:border-[#423238] dark:bg-[#2a2024] sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-6 text-[#423238] dark:text-white sm:text-[18px]">
            Money stuck intelligence
          </h2>

          <p className="mt-1 text-[11px] leading-4 text-[#91868a] sm:text-xs">
            {safeMoney(totalAmount)} total pending, split by urgency
          </p>
        </div>

        <button
          onClick={onRemind}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#ddd6d0] bg-white px-3 py-2.5 text-[12px] font-medium text-[#675d60] shadow-sm transition hover:border-[#8f2039] hover:text-[#8f2039] active:scale-[0.98] sm:w-auto sm:px-4"
        >
          <Bell size={14} strokeWidth={1.8} />
          <span>Send smart reminders</span>
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[#eee9e5]">
        {safeGroups.map((group, index) => {
          const amount = Math.max(
            0,
            Number(group.amount || 0),
          );

          const width =
            totalAmount > 0
              ? (amount / totalAmount) * 100
              : 0;

          return (
            <div
              key={`${group.label}-${index}`}
              className={`${colors[index].dot} min-w-0 transition-all duration-500`}
              style={{
                width: `${width}%`,
              }}
            />
          );
        })}
      </div>

      {/* Groups */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {safeGroups.map((group, index) => (
          <div
            key={`${group.label}-${index}`}
            className="flex min-w-0 items-center justify-between gap-2 rounded-[15px] border border-[#e4ddd7] bg-[#fffdfb] px-3 py-3 dark:border-[#423238] dark:bg-[#2d2428]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${colors[index].dot}`}
              />

              <span
                className={`min-w-0 truncate text-[10px] leading-4 ${colors[index].text} dark:text-[#c9bdc0] sm:text-[11px]`}
                title={group.label}
              >
                {group.label}
              </span>
            </div>

            <strong className="shrink-0 whitespace-nowrap text-[10px] font-semibold text-[#51494b] dark:text-white sm:text-[11px]">
              {safeMoney(group.amount)}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}