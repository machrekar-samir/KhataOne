import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  WalletCards,
} from "lucide-react";

const icons = {
  receivable: WalletCards,
  payable: WalletCards,
  overdue: CircleAlert,
  collected: CircleCheck,
};

export default function StatCard({
  label,
  value,
  detail,
  tone = "burgundy",
  trend,
  type,
}) {
  const Icon = icons[type] || WalletCards;
  return (
    <article className="relative rounded-xl border border-[#ebe7e3] bg-white p-4 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">
      <div
        className={`mb-3 grid size-8 place-items-center rounded-full ${tone === "green" ? "bg-[#e7f2eb] text-[#468264]" : tone === "red" ? "bg-[#fbecef] text-[#8f2039]" : tone === "blue" ? "bg-[#e9f0f8] text-[#55769a]" : "bg-[#f8e9ec] text-[#8f2039]"}`}
      >
        <Icon size={16} strokeWidth={1.8} />
      </div>
      <span className="block text-xs text-[#8b8383]">{label}</span>
      <strong className="my-2 block text-2xl tracking-tight">{value}</strong>
      <span
        className={`flex items-center gap-1 text-[11px] ${tone === "green" ? "text-[#468264]" : tone === "red" ? "text-[#bf6873]" : "text-[#8b8383]"}`}
      >
        {trend === "up" ? (
          <ArrowUpRight size={12} />
        ) : trend === "down" ? (
          <ArrowDownRight size={12} />
        ) : null}
        {detail}
      </span>
    </article>
  );
}
