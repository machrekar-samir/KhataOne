import { BellRing } from "lucide-react";

const colors = [
  { bg: "bg-[#c23b45]" },
  { bg: "bg-[#d99b2b]" },
  { bg: "bg-[#4d7f9e]" },
  { bg: "bg-[#3f8668]" },
];

export default function MoneyStuckCard({
  groups = [],
  total = 0,
  onRemind,
  money,
}) {
  const safeTotal = Number(total || 0);

  return (
    <section className="h-full min-h-[0] rounded-[22px] border border-[#e4ddd5] bg-[#fffdf9] p-6 shadow-[0_4px_14px_rgba(73,48,35,0.04)] dark:border-[#423238] dark:bg-[#2b2226]">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#423238] dark:text-white">
            Money stuck intelligence
          </h2>

          <p className="mt-0.5 text-[12px] text-[#82777b] dark:text-[#b9adb1]">
            {money(safeTotal)} total pending, split by urgency
          </p>
        </div>

        <button
          onClick={onRemind}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-[#ddd6d0] bg-white px-3.5 py-2 text-[12px] font-medium text-[#5f5558] shadow-sm transition hover:border-[#cdaeb3] dark:border-[#493b40] dark:bg-[#33282c]"
        >
          <BellRing size={14} strokeWidth={1.8} />
          Send smart reminders
        </button>
      </div>

      {/* Progress */}
      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-[#eee9e5]">
        {groups.map((group, index) => {
          const amount = Number(group.amount || 0);

          return (
            <span
              key={group.label}
              className={colors[index]?.bg || "bg-[#9b7c80]"}
              style={{
                flexGrow:
                  safeTotal > 0
                    ? Math.max(amount, safeTotal * 0.015)
                    : 1,
                flexBasis: 0,
              }}
            />
          );
        })}
      </div>

      {/* Breakdown */}
      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
        {groups.map((group, index) => {
          const color = colors[index] || colors[0];

          return (
            <div
              key={group.label}
              className="flex h-[52px] items-center gap-2.5 rounded-[18px] border border-[#e2dcd6] px-4 dark:border-[#493b40]"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.bg}`}
              />

              <span className="min-w-0 flex-1 truncate text-[12px] text-[#655c60] dark:text-[#b9adb1]">
                {group.label}
              </span>

              <strong className="shrink-0 text-[12px] font-semibold text-[#51494b] dark:text-white">
                {money(Number(group.amount || 0))}
              </strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}