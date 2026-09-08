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
    const totalCustomers = customers.length;

    // Collection health
    const collectionScore =
      receivable <= 0
        ? 100
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((receivable - overdue) / receivable) * 100,
              ),
            ),
          );

    // Customer risk
    const riskyCustomers = customers.filter(
      (customer) =>
        Number(customer.outstanding || 0) > 0 &&
        Number(customer.score || 100) < 60,
    ).length;

    const customerRisk =
      totalCustomers === 0
        ? 100
        : Math.max(
            0,
            Math.round(
              ((totalCustomers - riskyCustomers) / totalCustomers) * 100,
            ),
          );

    // Cash flow
    const income = transactions
      .filter(
        (item) =>
          item.type === "payment" ||
          item.type === "received" ||
          item.type === "collection",
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    const expense = transactions
      .filter(
        (item) =>
          item.type === "expense" ||
          item.type === "payable",
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    const cashFlow =
      income + expense === 0
        ? 70
        : Math.max(
            0,
            Math.min(
              100,
              Math.round((income / (income + expense)) * 100),
            ),
          );

    // Pending amount score
    const pendingScore =
      receivable === 0
        ? 100
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(
                ((receivable - overdue) / receivable) * 100,
              ),
            ),
          );

    const overall = Math.round(
      (collectionScore +
        customerRisk +
        cashFlow +
        pendingScore) /
        4,
    );

    return {
      overall,
      cashFlow,
      collectionScore,
      customerRisk,
      pendingScore,
    };
  }, [customers, transactions, receivable, overdue]);

  const status =
    health.overall >= 80
      ? "Excellent"
      : health.overall >= 60
        ? "Healthy"
        : health.overall >= 40
          ? "Needs attention"
          : "Critical";

  const Progress = ({ label, value }) => (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-[#5f5559] dark:text-[#c9bec1]">
          {label}
        </span>

        <span className="font-medium text-[#766b6f]">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#ebe7e3] dark:bg-[#45363b]">
        <div
          className="h-full rounded-full bg-[#66887a] transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#ddd6d0] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2a2024] sm:p-6">

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-[22px] font-semibold text-[#423238] dark:text-white">
          Business health
        </h2>

        <HeartPulse
          size={18}
          className="text-[#8f2039]"
        />
      </div>

      {/* Circle */}
      <div className="my-5 flex justify-center">
        <div
          className="relative grid h-[130px] w-[130px] place-items-center rounded-full"
          style={{
            background: `conic-gradient(
              #66887a ${health.overall * 3.6}deg,
              #ebe8e4 0deg
            )`,
          }}
        >
          <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white dark:bg-[#2a2024]">
            <div className="text-center">
              <strong className="block text-[27px] font-bold text-[#423238] dark:text-white">
                {health.overall}
              </strong>

              <span className="text-xs text-[#91868a]">
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mb-5 text-center text-base font-semibold text-[#66887a]">
        {status}
      </p>

      <div className="space-y-4">
        <Progress
          label="Cash flow"
          value={health.cashFlow}
        />

        <Progress
          label="Collections"
          value={health.collectionScore}
        />

        <Progress
          label="Customer risk"
          value={health.customerRisk}
        />

        <Progress
          label="Pending amount"
          value={health.pendingScore}
        />
      </div>

      <p className="mt-5 border-t border-[#eee9e5] pt-4 text-center text-[11px] text-[#91868a] dark:border-[#423238]">
        Updates automatically based on your business activity
      </p>
    </div>
  );
}