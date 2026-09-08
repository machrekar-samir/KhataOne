import { useMemo } from "react";

export default function CashFlowChart({ transactions = [] }) {
  const chartData = useMemo(() => {
    const months = {};
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1,
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      months[key] = {
        key,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        received: 0,
        expense: 0,
      };
    }

    const getDate = (value) => {
      if (!value) return null;

      if (typeof value?.toDate === "function") {
        return value.toDate();
      }

      if (value?.seconds) {
        return new Date(value.seconds * 1000);
      }

      const date = new Date(value);

      return Number.isNaN(date.getTime())
        ? null
        : date;
    };

    transactions.forEach((item) => {
      const date = getDate(item?.date);

      if (!date) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      if (!months[key]) return;

      const amount = Math.abs(
        Number(item.amount || 0),
      );

      const type = String(
        item.type || "",
      )
        .trim()
        .toLowerCase();

      if (!amount) return;

      const receivedTypes = [
        "payment",
        "received",
        "collection",
        "income",
        "credit",
        "sale",
        "receive",
      ];

      const expenseTypes = [
        "expense",
        "payable",
        "purchase",
        "debit",
        "paid",
      ];

      if (receivedTypes.includes(type)) {
        months[key].received += amount;
      }

      if (expenseTypes.includes(type)) {
        months[key].expense += amount;
      }
    });

    const data = Object.values(months);

    // Empty chart ke liye reference-style demo baseline
    const hasRealData = data.some(
      (item) =>
        item.received > 0 ||
        item.expense > 0,
    );

    if (!hasRealData) {
      return data.map((item, index) => ({
        ...item,
        received: [42, 48, 52, 50, 57, 61][index],
        expense: [52, 49, 55, 46, 60, 56][index],
        demo: true,
      }));
    }

    return data;
  }, [transactions]);

  const hasRealData = useMemo(
    () => chartData.some((item) => !item.demo),
    [chartData],
  );

  const totalReceived = useMemo(
    () =>
      chartData.reduce(
        (sum, item) =>
          sum +
          (item.demo ? 0 : item.received),
        0,
      ),
    [chartData],
  );

  const totalExpense = useMemo(
    () =>
      chartData.reduce(
        (sum, item) =>
          sum +
          (item.demo ? 0 : item.expense),
        0,
      ),
    [chartData],
  );

  const width = 700;
  const height = 250;

  const padding = {
    top: 20,
    right: 20,
    bottom: 32,
    left: 58,
  };

  const graphWidth =
    width -
    padding.left -
    padding.right;

  const graphHeight =
    height -
    padding.top -
    padding.bottom;

  const rawMax = Math.max(
    ...chartData.map((item) =>
      Math.max(
        item.received,
        item.expense,
      ),
    ),
    100,
  );

  const maxValue =
    Math.ceil(rawMax / 100) * 100;

  const getX = (index) =>
    padding.left +
    (index * graphWidth) /
      Math.max(
        chartData.length - 1,
        1,
      );

  const getY = (value) =>
    padding.top +
    graphHeight -
    (value / maxValue) * graphHeight;

  // Smooth curve
  const createSmoothPath = (key) => {
    if (!chartData.length) return "";

    const points = chartData.map(
      (item, index) => ({
        x: getX(index),
        y: getY(item[key]),
      }),
    );

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      const controlX =
        (current.x + next.x) / 2;

      path += `
        C ${controlX} ${current.y},
        ${controlX} ${next.y},
        ${next.x} ${next.y}
      `;
    }

    return path;
  };

  const receivedPath =
    createSmoothPath("received");

  const expensePath =
    createSmoothPath("expense");

  const createAreaPath = (path) => `
    ${path}
    L ${getX(chartData.length - 1)} ${
      padding.top + graphHeight
    }
    L ${getX(0)} ${
      padding.top + graphHeight
    }
    Z
  `;

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      },
    );

  return (
    <section className="h-[382px] overflow-hidden rounded-[22px] border border-[#ddd6d0] bg-[#fffdfb] p-6 shadow-sm dark:border-[#423238] dark:bg-[#2a2024]">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-[#423238] dark:text-white">
            Cash flow trend
          </h2>

          <div className="mt-1 flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3f8062] opacity-60" />

              <span className="relative inline-flex size-2 rounded-full bg-[#3f8062]" />
            </span>

            <p className="text-[11px] text-[#91868a]">
              {hasRealData
                ? "Live business activity"
                : "Business trend overview"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="rounded-lg bg-[#edf4f1] px-3 py-1.5">
            <p className="text-[9px] text-[#66887a]">
              Received
            </p>

            <p className="text-[12px] font-bold text-[#477a63]">
              ₹{formatMoney(totalReceived)}
            </p>
          </div>

          <div className="rounded-lg bg-[#f8eeee] px-3 py-1.5">
            <p className="text-[9px] text-[#a94c55]">
              Expenses
            </p>

            <p className="text-[12px] font-bold text-[#8f2039]">
              ₹{formatMoney(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4 h-[250px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="receivedGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3f8062"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#3f8062"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="expenseGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#6b1d2b"
                stopOpacity="0.14"
              />

              <stop
                offset="100%"
                stopColor="#6b1d2b"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Horizontal grid */}
          {[0, 1, 2, 3, 4].map((item) => {
            const y =
              padding.top +
              (item * graphHeight) / 4;

            const value =
              maxValue -
              (maxValue * item) / 4;

            return (
              <g key={item}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#eee9e5"
                  strokeWidth="1"
                />

                <text
                  x="8"
                  y={y + 4}
                  fontSize="10"
                  fill="#91868a"
                >
                  {Math.round(value / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Burgundy area */}
          <path
            d={createAreaPath(expensePath)}
            fill="url(#expenseGradient)"
          />

          {/* Green area */}
          <path
            d={createAreaPath(receivedPath)}
            fill="url(#receivedGradient)"
          />

          {/* Expense line */}
          <path
            d={expensePath}
            fill="none"
            stroke="#6b1d2b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700"
          />

          {/* Received line */}
          <path
            d={receivedPath}
            fill="none"
            stroke="#3f8062"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-700"
          />

          {/* Month labels */}
          {chartData.map(
            (item, index) => (
              <text
                key={item.key}
                x={getX(index)}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#756d70"
              >
                {item.label}
              </text>
            ),
          )}
        </svg>
      </div>

      {/* Footer legend */}
      <div className="mt-1 flex items-center justify-center gap-5 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3f8062]" />
          <span className="text-[#82777b]">
            Money received
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#6b1d2b]" />
          <span className="text-[#82777b]">
            Expenses
          </span>
        </div>
      </div>
    </section>
  );
}