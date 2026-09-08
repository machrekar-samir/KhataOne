import { useMemo } from "react";

export default function CashFlowChart({ transactions = [] }) {
  const chartData = useMemo(() => {
    const months = [];
    const monthMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);

      const key = `${d.getFullYear()}-${d.getMonth()}`;

      const item = {
        key,
        month: d.toLocaleDateString("en-IN", { month: "short" }),
        received: 0,
        expenses: 0,
      };

      months.push(item);
      monthMap[key] = item;
    }

    transactions.forEach((tx) => {
      const rawDate = tx?.date || tx?.createdAt || tx?.transactionDate;

      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthMap[key]) return;

      const amount = Number(
        tx?.amount || tx?.total || tx?.value || 0,
      );

      if (!amount) return;

      const type = String(tx?.type || "").toLowerCase();
      const status = String(tx?.status || "").toLowerCase();

      // Received / collection transactions
      const isReceived = [
        "received",
        "receive",
        "payment",
        "collection",
        "income",
        "credit",
      ].includes(type);

      // Expense transactions
      const isExpense = [
        "expense",
        "payable",
        "purchase",
        "debit",
        "paid",
      ].includes(type);

      // Pending amount ko received nahi count karenge
      const isPending = [
        "pending",
        "unpaid",
        "due",
      ].includes(status);

      if (isReceived && !isPending) {
        monthMap[key].received += amount;
      }

      if (isExpense) {
        monthMap[key].expenses += amount;
      }
    });

    return months;
  }, [transactions]);

  const totalReceived = chartData.reduce(
    (sum, item) => sum + item.received,
    0,
  );

  const totalExpenses = chartData.reduce(
    (sum, item) => sum + item.expenses,
    0,
  );

  const maxValue = Math.max(
    ...chartData.flatMap((item) => [
      item.received,
      item.expenses,
    ]),
    100,
  );

  const chartMax = Math.ceil(maxValue / 1000) * 1000 || 1000;

  const width = 700;
  const height = 280;
  const padding = {
    top: 20,
    right: 20,
    bottom: 45,
    left: 50,
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const getX = (index) =>
    padding.left +
    (index * chartWidth) /
      Math.max(chartData.length - 1, 1);

  const getY = (value) =>
    padding.top +
    chartHeight -
    (value / chartMax) * chartHeight;

  const createPath = (key) =>
    chartData
      .map((item, index) => {
        const x = getX(index);
        const y = getY(Number(item[key]) || 0);

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

  const createAreaPath = (key) => {
    const line = createPath(key);

    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const bottom = padding.top + chartHeight;

    return `${line} L ${lastX} ${bottom} L ${firstX} ${bottom} Z`;
  };

  const formatAmount = (value) => {
    if (value >= 100000)
      return `${(value / 100000).toFixed(1)}L`;

    if (value >= 1000)
      return `${Math.round(value / 1000)}k`;

    return value;
  };

  const hasData =
    totalReceived > 0 || totalExpenses > 0;

  const gridLines = 4;

  return (
    <div className="min-h-[380px] rounded-[24px] border border-[#e4ddd7] bg-white p-6 shadow-[0_8px_30px_rgba(80,55,40,0.06)]">
      
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#332a2d]">
            Cash flow trend
          </h2>

          <p className="mt-1 text-[12px] text-[#8b8183]">
            Real-time business activity · Last 6 months
          </p>
        </div>

        <div className="flex gap-2">
          <div className="rounded-xl bg-[#edf4f0] px-4 py-2">
            <p className="text-[11px] text-[#718078]">
              Received
            </p>

            <p className="mt-1 text-sm font-semibold text-[#3f8066]">
              ₹{totalReceived.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl bg-[#f8eeee] px-4 py-2">
            <p className="text-[11px] text-[#9a777c]">
              Expenses
            </p>

            <p className="mt-1 text-sm font-semibold text-[#702536]">
              ₹{totalExpenses.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[270px] flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f1ee] text-2xl">
            📊
          </div>

          <p className="font-semibold text-[#51474a]">
            No cash flow data yet
          </p>

          <p className="mt-1 text-center text-xs text-[#9a9092]">
            Add received or expense transactions and
            <br />
            your chart will update automatically
          </p>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient
                id="receivedFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3f8066"
                  stopOpacity="0.25"
                />

                <stop
                  offset="100%"
                  stopColor="#3f8066"
                  stopOpacity="0"
                />
              </linearGradient>

              <linearGradient
                id="expenseFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#702536"
                  stopOpacity="0.18"
                />

                <stop
                  offset="100%"
                  stopColor="#702536"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Grid */}
            {Array.from({
              length: gridLines + 1,
            }).map((_, index) => {
              const value =
                (chartMax / gridLines) *
                (gridLines - index);

              const y =
                padding.top +
                (chartHeight / gridLines) * index;

              return (
                <g key={index}>
                  <line
                    x1={padding.left}
                    x2={width - padding.right}
                    y1={y}
                    y2={y}
                    stroke="#eee9e5"
                    strokeDasharray="3 5"
                  />

                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#8c8385"
                  >
                    {formatAmount(value)}
                  </text>
                </g>
              );
            })}

            {/* Received gradient */}
            <path
              d={createAreaPath("received")}
              fill="url(#receivedFill)"
            />

            {/* Expense gradient */}
            <path
              d={createAreaPath("expenses")}
              fill="url(#expenseFill)"
            />

            {/* Received line */}
            <path
              d={createPath("received")}
              fill="none"
              stroke="#3f8066"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Expense line */}
            <path
              d={createPath("expenses")}
              fill="none"
              stroke="#702536"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Received points */}
            {chartData.map((item, index) => (
              <circle
                key={`received-${item.key}`}
                cx={getX(index)}
                cy={getY(item.received)}
                r="3.5"
                fill="#3f8066"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}

            {/* Expense points */}
            {chartData.map((item, index) => (
              <circle
                key={`expense-${item.key}`}
                cx={getX(index)}
                cy={getY(item.expenses)}
                r="3.5"
                fill="#702536"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}

            {/* Month labels */}
            {chartData.map((item, index) => (
              <text
                key={item.key}
                x={getX(index)}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#7f7779"
              >
                {item.month}
              </text>
            ))}
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-[#746a6d]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3f8066]" />
          Money Received
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#702536]" />
          Expenses
        </div>
      </div>
    </div>
  );
}