import {
  TrendingUp,
  TrendingDown,
  CircleAlert,
  CircleCheck,
  WalletCards,
  Landmark,
} from "lucide-react";

const icons = {
  receivable: WalletCards,
  payable: Landmark,
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

  const styles = {
    burgundy: {
      bg: "bg-[#f8ecec]",
      icon: "text-[#7a2633]",
    },
    blue: {
      bg: "bg-[#eaf1f5]",
      icon: "text-[#55758c]",
    },
    red: {
      bg: "bg-[#faeded]",
      icon: "text-[#c65b62]",
    },
    green: {
      bg: "bg-[#eaf4ee]",
      icon: "text-[#3f8b68]",
    },
  };

  const current = styles[tone] || styles.burgundy;

  return (
    <article className="min-h-[140px] rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] px-5 py-4 shadow-[0_4px_14px_rgba(73,48,35,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#423238] dark:bg-[#2b2226]">
      
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-[#756d70] dark:text-[#b9adb1]">
          {label}
        </span>

        <div
          className={`grid h-9 w-9 place-items-center rounded-full ${current.bg} ${current.icon}`}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>

      <strong className="mt-3 block text-[24px] font-semibold tracking-[-0.03em] text-[#3f3739] dark:text-white">
        {value}
      </strong>

      <div
        className={`mt-1.5 flex items-center gap-1 text-[11px] ${
          tone === "red"
            ? "text-[#b95058]"
            : tone === "green" || tone === "burgundy"
              ? "text-[#438464]"
              : "text-[#756d70]"
        }`}
      >
        {trend === "up" && <TrendingUp size={12} strokeWidth={2} />}
        {trend === "down" && <TrendingDown size={12} strokeWidth={2} />}
        <span>{detail}</span>
      </div>
    </article>
  );
}