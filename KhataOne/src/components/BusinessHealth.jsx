import { HeartPulse } from "lucide-react";
import { useMemo } from "react";

export default function BusinessHealth({
  customers = [],
  transactions = [],
  receivable = 0,
  overdue = 0,
  collected = 0,
}) {
  const health = useMemo(() => {
    const pendingCustomers = customers.filter(
      (customer) => Number(customer.outstanding || 0) > 0,
    );

    const income = transactions
      .filter((item) =>
        ["payment", "received", "collection", "income"].includes(
          String(item.type || "").toLowerCase(),
        ),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const expense = transactions
      .filter((item) =>
        ["expense", "payable", "purchase"].includes(
          String(item.type || "").toLowerCase(),
        ),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const cashFlow =
      income + expense === 0
        ? 50
        : Math.round(
            Math.min(
              100,
              Math.max(0, (income / (income + expense)) * 100),
            ),
          );

    const totalBusinessAmount =
      Number(receivable || 0) + Number(collected || 0);

    const collectionScore =
      totalBusinessAmount <= 0
        ? 50
        : Math.round(
            Math.min(
              100,
              Math.max(
                0,
                (Number(collected || 0) / totalBusinessAmount) * 100,
              ),
            ),
          );

    const riskyCustomers = pendingCustomers.filter(
      (customer) => Number(customer.score || 100) < 60,
    ).length;

    const customerRisk =
      pendingCustomers.length === 0
        ? 100
        : Math.round(
            Math.max(
              0,
              Math.min(
                100,
                ((pendingCustomers.length - riskyCustomers) /
                  pendingCustomers.length) *
                  100,
              ),
            ),
          );

    const pendingScore =
      receivable <= 0
        ? 100
        : Math.round(
            Math.max(
              0,
              Math.min(
                100,
                ((Number(receivable) - Number(overdue || 0)) /
                  Number(receivable)) *
                  100,
              ),
            ),
          );

    const overall = Math.round(
      cashFlow * 0.25 +
        collectionScore * 0.3 +
        customerRisk * 0.2 +
        pendingScore * 0.25,
    );

    return {
      overall,
      cashFlow,
      collectionScore,
      customerRisk,
      pendingScore,
    };
  }, [customers, transactions, receivable, overdue, collected]);

  const status =
    health.overall >= 85
      ? "Excellent"
      : health.overall >= 65
        ? "Healthy"
        : health.overall >= 40
          ? "Needs attention"
          : "Critical";

  const statusColor =
    health.overall >= 85
      ? "#3f8062"
      : health.overall >= 65
        ? "#66887a"
        : health.overall >= 40
          ? "#c99232"
          : "#b94b55";

  const Progress = ({ label, value }) => {
    const safeValue = Math.min(
      100,
      Math.max(0, Math.round(Number(value) || 0)),
    );

    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#655c60] dark:text-[#c9bec1]">
            {label}
          </span>

          <span className="text-[11px] font-semibold text-[#655c60] dark:text-white">
            {safeValue}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e4e1] dark:bg-[#45363b]">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${safeValue}%`,
              backgroundColor:
                safeValue >= 75
                  ? "#66887a"
                  : safeValue >= 45
                    ? "#c99a3b"
                    : "#b94b55",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="rounded-[20px] border border-[#ddd6d0] bg-[#fffdfb] p-5 shadow-sm dark:border-[#423238] dark:bg-[#2a2024]">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[19px] font-semibold text-[#423238] dark:text-white">
            Business health
          </h2>

          <p className="mt-0.5 text-[10px] text-[#91868a]">
            Live business performance
          </p>
        </div>

        <div className="grid size-9 place-items-center rounded-xl bg-[#f6e9ec]">
          <HeartPulse size={16} className="text-[#8f2039]" />
        </div>
      </div>

      {/* Compact Circle */}
      <div className="my-3 flex flex-col items-center">
        <div
          className="relative grid h-[112px] w-[112px] place-items-center rounded-full transition-all duration-700"
          style={{
            background: `conic-gradient(
              ${statusColor} ${health.overall * 3.6}deg,
              #e8e5e2 ${health.overall * 3.6}deg
            )`,
          }}
        >
          <div className="grid h-[90px] w-[90px] place-items-center rounded-full bg-[#fffdfb] dark:bg-[#2a2024]">
            <div className="text-center">
              <strong className="block text-[25px] font-semibold text-[#423238] dark:text-white">
                {health.overall}
              </strong>

              <span className="text-[10px] text-[#91868a]">
                / 100
              </span>
            </div>
          </div>
        </div>

        <span
          className="mt-2 text-[12px] font-semibold"
          style={{ color: statusColor }}
        >
          {status}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-4 space-y-3">
        <Progress label="Cash flow" value={health.cashFlow} />
        <Progress label="Collections" value={health.collectionScore} />
        <Progress label="Customer risk" value={health.customerRisk} />
        <Progress label="Pending amount" value={health.pendingScore} />
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-[#e9e4df] pt-3 text-center dark:border-[#423238]">
        <p className="text-[9px] text-[#91868a]">
          Live • {customers.length} customers • {transactions.length} transactions
        </p>
      </div>
    </section>
  );
}