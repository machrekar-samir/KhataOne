import {
  Sparkles,
  Send,
  Bot,
  TrendingUp,
  TrendingDown,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  Bell,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  Coins,
  Clock3,
  CircleDollarSign,
} from "lucide-react";
import { useMemo, useState } from "react";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const avatarColors = [
  "bg-[#f7e5e6] text-[#8f2039]",
  "bg-[#f7eee0] text-[#a56f12]",
  "bg-[#e8f2ec] text-[#3f8062]",
  "bg-[#e8eff5] text-[#52728a]",
];

export default function AIInsights({
  customers = [],
  transactions = [],
  onAction,
}) {
  const [period, setPeriod] = useState("Weekly");
  const [query, setQuery] = useState("");

  const data = useMemo(() => {
    const totalDue = customers.reduce(
      (sum, item) =>
        sum +
        Number(item.outstanding || item.balance || item.pendingAmount || 0),
      0,
    );

    const pendingCustomers = customers.filter(
      (item) =>
        Number(item.outstanding || item.balance || item.pendingAmount || 0) > 0,
    );

    const collected = transactions
      .filter((item) =>
        [
          "payment",
          "received",
          "collection",
          "income",
          "credit",
          "sale",
        ].includes(String(item.type || "").toLowerCase()),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const overdue = pendingCustomers.reduce((sum, item) => {
      const amount = Number(
        item.outstanding || item.balance || item.pendingAmount || 0,
      );

      return sum + (Number(item.daysOverdue || 0) > 0 ? amount : 0);
    }, 0);

    const collectionRate =
      totalDue + collected > 0
        ? Math.round((collected / (totalDue + collected)) * 100)
        : 93;

    const health = collectionRate >= 85 ? 78 : collectionRate >= 60 ? 65 : 48;

    return {
      totalDue,
      pending: pendingCustomers.length,
      collected,
      overdue,
      collectionRate,
      health,
    };
  }, [customers, transactions]);

  const predictions = useMemo(() => {
    if (customers.length) {
      return customers.slice(0, 6).map((customer, index) => {
        const amount = Number(
          customer.outstanding ||
            customer.balance ||
            customer.pendingAmount ||
            [7400, 18500, 12000, 9200, 1800, 7400][index] ||
            0,
        );

        const score = Number(customer.score || [83, 8, 66, 55, 93, 21][index]);

        return {
          id: customer.id || index,
          name:
            customer.name ||
            customer.customerName ||
            [
              "Ramesh Kumar",
              "Suresh Patil",
              "Anita Sharma",
              "Farhan Qureshi",
              "Meera Joshi",
              "Vikram Desai",
            ][index],
          amount,
          score,
        };
      });
    }

    return [
      {
        id: 1,
        name: "Ramesh Kumar",
        amount: 7400,
        score: 83,
      },
      {
        id: 2,
        name: "Suresh Patil",
        amount: 18500,
        score: 8,
      },
      {
        id: 3,
        name: "Anita Sharma",
        amount: 12000,
        score: 66,
      },
      {
        id: 4,
        name: "Farhan Qureshi",
        amount: 9200,
        score: 55,
      },
      {
        id: 5,
        name: "Meera Joshi",
        amount: 1800,
        score: 93,
      },
      {
        id: 6,
        name: "Vikram Desai",
        amount: 7400,
        score: 21,
      },
    ];
  }, [customers]);

  const summary = useMemo(() => {
    const high = predictions.filter((item) => item.score >= 70);

    const medium = predictions.filter(
      (item) => item.score >= 40 && item.score < 70,
    );

    const low = predictions.filter((item) => item.score < 40);

    const sum = (list) =>
      list.reduce((total, item) => total + Number(item.amount || 0), 0);

    return {
      high: sum(high),
      medium: sum(medium),
      low: sum(low),
    };
  }, [predictions]);

  const trendData = [
    { month: "Apr", collected: 24, pending: 7 },
    { month: "May", collected: 19, pending: 12 },
    { month: "Jun", collected: 21, pending: 9 },
    { month: "Jul", collected: 28, pending: 14 },
    { month: "Aug", collected: 27, pending: 10 },
    { month: "Sep", collected: 30, pending: 15 },
  ];

  const getPrediction = (score) => {
    if (score >= 70)
      return {
        label: "High",
        color: "bg-[#e6f3eb] text-[#39795d] border-[#cce4d6]",
      };

    if (score >= 40)
      return {
        label: "Medium",
        color: "bg-[#fff5dd] text-[#a47716] border-[#f0ddb0]",
      };

    return {
      label: "Low",
      color: "bg-[#fcebed] text-[#b84b59] border-[#f1cbd1]",
    };
  };

  const suggestions = [
    {
      icon: Phone,
      title: "Contact Ramesh Kumar",
      text: "High chance of payment this week",
      score: 83,
      tone: "green",
    },
    {
      icon: Mail,
      title: "Follow up with Anita Sharma",
      text: "Payment is 14 days overdue",
      score: 66,
      tone: "amber",
    },
    {
      icon: Bell,
      title: "Send reminder to 3 customers",
      text: "Payments are due in next 7 days",
      score: 72,
      tone: "green",
    },
    {
      icon: TrendingDown,
      title: "Review Vikram Desai",
      text: "Payment behavior is declining",
      score: 21,
      tone: "red",
    },
  ];

  const toneStyle = {
    green: "bg-[#e9f4ed] text-[#3f8062]",
    amber: "bg-[#fff4dd] text-[#a97715]",
    red: "bg-[#f9e9eb] text-[#b94b55]",
  };

  const handleAsk = () => {
    if (!query.trim()) return;

    if (onAction) {
      onAction("ai-query", query);
    }

    setQuery("");
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={22} className="text-[#8f2039]" />

            <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#383134] dark:text-white sm:text-[30px]">
              AI Insights
            </h1>
          </div>

          <p className="mt-1 text-[13px] text-[#766d70] dark:text-[#b9adb1]">
            KhataOne AI — your intelligent collection assistant.
          </p>
        </div>

        <div className="hidden rotate-[-8deg] text-right font-serif text-[16px] italic leading-tight text-[#7a2633] sm:block">
          Smarter Insights
          <br />
          Higher Collections →
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        {/* AI HERO */}
        <section className="overflow-hidden rounded-[20px] border border-[#e4ddd5] bg-gradient-to-br from-[#fff9f7] via-[#fffdfb] to-[#f8f1ed] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:from-[#2d2327] dark:via-[#2a2024] dark:to-[#32272b] sm:p-5">
          {/* TOP */}
          <div className="flex items-center gap-4">
            {/* BOT */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-[18px] bg-[#f2dce0] blur-lg" />

              <div className="relative grid h-[76px] w-[76px] place-items-center rounded-[18px] border border-[#ead9d8] bg-white shadow-sm dark:border-[#513a41] dark:bg-[#35282d]">
                <Bot size={40} strokeWidth={1.5} className="text-[#7a2633]" />

                <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#45966d]" />
              </div>
            </div>

            {/* GREETING */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-bold tracking-tight text-[#423238] dark:text-white">
                  Hello Samir! 👋
                </h2>

                <span className="rounded-full bg-[#edf5ef] px-2 py-[3px] text-[8px] font-semibold text-[#438464]">
                  AI Online
                </span>
              </div>

              <p className="mt-1 max-w-[470px] text-[11px] leading-[18px] text-[#71676b] dark:text-[#b9adb1]">
                I can help you with customer insights, pending payments,
                predictions and recovery suggestions.
              </p>
            </div>
          </div>

         
         
        
          {/* QUICK QUESTIONS */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              "How much money is overdue?",
              "Who should I contact today?",
              "Which customer is most risky?",
              "Show this week's collection summary",
            ].map((item) => (
              <button
                key={item}
                onClick={() => onAction?.("ai-query", item)}
                className="rounded-full border border-[#e1d8d3] bg-white/80 px-3 py-2 text-left text-[11px] font-medium text-[#62585c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b98b93] hover:bg-[#fff] hover:shadow-sm dark:border-[#493b40] dark:bg-[#32272b] dark:text-[#d6cbd0]"
              >
                {item}
              </button>
            ))}
          </div>

          {/* ASK INPUT */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e2d9d4] bg-white p-1.5 shadow-sm dark:border-[#493b40] dark:bg-[#32272b]">
            <Sparkles size={16} className="ml-2 shrink-0 text-[#8f2039]" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              placeholder="Ask anything about your business..."
              className="min-w-0 flex-1 bg-transparent px-1 text-[12px] text-[#51494b] outline-none placeholder:text-[#aaa0a2] dark:text-white"
            />

            <button
              onClick={handleAsk}
              className="grid size-9 place-items-center rounded-lg bg-[#7a2633] text-white transition hover:bg-[#601b27] hover:shadow-md active:scale-95"
            >
              <Send size={15} />
            </button>
          </div>
        </section>

        {/* BUSINESS HEALTH */}
        <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226] sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
              Business Health
            </h2>

            <ShieldCheck size={17} className="text-[#8c8184]" />
          </div>

          <div className="mt-2 flex items-center justify-around gap-4">
            {/* CIRCLE */}
            <div
              className="grid h-[128px] w-[128px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#3f8062 ${
                  data.health * 3.6
                }deg, #ebe7e3 ${data.health * 3.6}deg)`,
              }}
            >
              <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#fffdf9] dark:bg-[#2b2226]">
                <div className="text-center">
                  <strong className="block text-[27px] text-[#423238] dark:text-white">
                    {data.health}
                  </strong>

                  <span className="text-[10px] text-[#91868a]">/ 100</span>
                </div>
              </div>
            </div>

            <div className="hidden max-w-[145px] md:block">
              <p className="flex items-center gap-1 text-[16px] font-bold text-[#3f8062]">
                <TrendingUp size={17} />
                Healthy
              </p>

              <p className="mt-2 text-[11px] leading-4 text-[#766d70]">
                Your business is in good shape. Keep up the great work!
              </p>
            </div>
          </div>

          {/* HEALTH STATS */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              [CircleDollarSign, money(data.totalDue), "Total Due", "burgundy"],
              [Users, data.pending || 32, "Pending Customers", "red"],
              [TrendingUp, "18% ↑", "Increase this month", "green"],
              [
                ShieldCheck,
                `${data.collectionRate}%`,
                "Collection Rate",
                "green",
              ],
            ].map(([Icon, value, label, tone], index) => (
              <div
                key={index}
                className="rounded-xl border border-[#ebe4df] bg-[#fffaf7] p-2.5 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-[#493b40] dark:bg-[#32272b]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`grid size-7 place-items-center rounded-lg ${
                      tone === "green"
                        ? "bg-[#e8f3ec] text-[#3f8062]"
                        : "bg-[#f8e9eb] text-[#8f2039]"
                    }`}
                  >
                    <Icon size={14} />
                  </span>

                  <div className="min-w-0">
                    <strong className="block truncate text-[13px] text-[#423238] dark:text-white">
                      {value}
                    </strong>

                    <span className="block truncate text-[9px] text-[#81777a]">
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* MIDDLE GRID */}
      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        {/* COLLECTION TREND */}
        <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226] sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#8f2039]" />

              <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
                Collection Trend
              </h2>
            </div>

            <div className="flex rounded-full border border-[#e1d9d4] p-0.5 text-[10px]">
              {["Weekly", "Monthly"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-full px-3 py-1.5 font-medium transition ${
                    period === item
                      ? "bg-[#7a2633] text-white shadow-sm"
                      : "text-[#766d70]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-5 text-[10px]">
            <span className="flex items-center gap-1.5 text-[#6f6669]">
              <i className="size-2 rounded-full bg-[#3f8062]" />
              Collected
            </span>

            <span className="flex items-center gap-1.5 text-[#6f6669]">
              <i className="size-2 rounded-full bg-[#c92f47]" />
              Pending
            </span>
          </div>

          <div className="mt-3 h-[170px]">
            <svg
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              {[0, 1, 2, 3, 4].map((i) => {
                const y = 18 + i * 40;

                return (
                  <g key={i}>
                    <line
                      x1="45"
                      x2="580"
                      y1={y}
                      y2={y}
                      stroke="#ece7e3"
                      strokeWidth="1"
                    />

                    <text x="5" y={y + 4} fontSize="10" fill="#8e8588">
                      {40 - i * 10}k
                    </text>
                  </g>
                );
              })}

              {trendData.map((_, i) => {
                const x = 45 + (i * 535) / (trendData.length - 1);

                return (
                  <line
                    key={i}
                    x1={x}
                    x2={x}
                    y1="18"
                    y2="178"
                    stroke="#f1ece8"
                    strokeWidth="1"
                  />
                );
              })}

              <defs>
                <linearGradient id="greenFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3f8062" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#3f8062" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M45 78 C95 80,105 96,150 96 S205 90,255 88 S310 48,360 70 S420 85,470 58 S525 52,580 44 L580 178 L45 178 Z"
                fill="url(#greenFill)"
              />

              <path
                d="M45 78 C95 80,105 96,150 96 S205 90,255 88 S310 48,360 70 S420 85,470 58 S525 52,580 44"
                fill="none"
                stroke="#3f8062"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              <path
                d="M45 148 C95 128,105 120,150 124 S205 140,255 132 S310 112,360 120 S420 145,470 132 S525 118,580 106"
                fill="none"
                stroke="#c92f47"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {[
                [45, 78],
                [150, 96],
                [255, 88],
                [360, 70],
                [470, 58],
                [580, 44],
              ].map(([x, y], i) => (
                <circle key={`g-${i}`} cx={x} cy={y} r="4" fill="#3f8062" />
              ))}

              {[
                [45, 148],
                [150, 124],
                [255, 132],
                [360, 120],
                [470, 132],
                [580, 106],
              ].map(([x, y], i) => (
                <circle key={`r-${i}`} cx={x} cy={y} r="4" fill="#c92f47" />
              ))}

              {trendData.map((item, i) => {
                const x = 45 + (i * 535) / (trendData.length - 1);

                return (
                  <text
                    key={item.month}
                    x={x}
                    y="208"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#81777a"
                  >
                    {item.month}
                  </text>
                );
              })}
            </svg>
          </div>
        </section>

        {/* AI SUGGESTIONS */}
        <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226] sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#8f2039]" />

              <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
                AI Suggestions
              </h2>
            </div>

            <button className="text-[11px] font-semibold text-[#8f2039] hover:underline">
              View All
            </button>
          </div>

          <div className="mt-3 divide-y divide-[#eee7e2] dark:divide-[#423238]">
            {suggestions.map(
              ({ icon: Icon, title, text, score, tone }, index) => (
                <button
                  key={index}
                  onClick={() => onAction?.("suggestion", title)}
                  className="group flex w-full items-center gap-3 py-3 text-left transition hover:px-1"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneStyle[tone]}`}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-[12px] text-[#494043] dark:text-white">
                      {title}
                    </strong>

                    <small className="mt-0.5 block truncate text-[10px] text-[#857b7e]">
                      {text}
                    </small>
                  </span>

                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                      score >= 70
                        ? "border-[#b9dac7] bg-[#edf7f0] text-[#39795d]"
                        : score >= 40
                          ? "border-[#efd6a1] bg-[#fff8e8] text-[#a47716]"
                          : "border-[#edc3ca] bg-[#fff0f1] text-[#b94b55]"
                    }`}
                  >
                    {score}%
                  </span>

                  <ChevronRight
                    size={15}
                    className="shrink-0 text-[#aaa0a2] transition group-hover:translate-x-1"
                  />
                </button>
              ),
            )}
          </div>
        </section>
      </div>

      {/* PAYMENT PREDICTION */}
      <section className="rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226] sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#8f2039]" />

            <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
              Payment Prediction
            </h2>
          </div>

          <button className="text-[11px] font-semibold text-[#8f2039] hover:underline">
            How it works?
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Coins,
              title: "High probability",
              value: summary.high || 32000,
              subtitle: "Likely to be collected soon",
              box: "border-[#d4e9da] bg-gradient-to-r from-[#e5f3e9] to-[#f6fbf7]",
              iconBox: "bg-[#d6ebdc] text-[#3f8062]",
              valueColor: "text-[#2f674f]",
            },
            {
              icon: Clock3,
              title: "Medium probability",
              value: summary.medium || 11500,
              subtitle: "May require follow-up",
              box: "border-[#f0e1b7] bg-gradient-to-r from-[#fff5dd] to-[#fffaf0]",
              iconBox: "bg-[#ffefc6] text-[#c88a15]",
              valueColor: "text-[#55462a]",
            },
            {
              icon: AlertTriangle,
              title: "Low probability",
              value: summary.low || 5000,
              subtitle: "Needs immediate action",
              box: "border-[#f0d2d5] bg-gradient-to-r from-[#fdecee] to-[#fff8f8]",
              iconBox: "bg-[#f9dce0] text-[#c52e47]",
              valueColor: "text-[#b3293f]",
            },
          ].map(
            (
              { icon: Icon, title, value, subtitle, box, iconBox, valueColor },
              index,
            ) => (
              <div
                key={index}
                className={`group flex items-center gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${box}`}
              >
                <span
                  className={`grid size-11 place-items-center rounded-xl ${iconBox} transition group-hover:scale-110`}
                >
                  <Icon size={21} />
                </span>

                <div>
                  <p className="text-[11px] font-medium text-[#655b5f]">
                    {title}
                  </p>

                  <strong
                    className={`mt-1 block text-[22px] font-bold ${valueColor}`}
                  >
                    {money(value)}
                  </strong>

                  <small className="text-[10px] text-[#71676b]">
                    {subtitle}
                  </small>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* CUSTOMER PREDICTION TABLE */}
      <section className="overflow-hidden rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226]">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Users size={19} className="text-[#8f2039]" />

            <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
              Customer-wise Prediction
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="border-y border-[#ece5e0] bg-[#fdfaf7] text-left dark:border-[#423238] dark:bg-[#30262a]">
                {[
                  "Customer",
                  "Prediction",
                  "Amount",
                  "Trust Score",
                  "Factors",
                  "Action",
                ].map((item) => (
                  <th
                    key={item}
                    className="px-4 py-3 text-[10px] font-semibold text-[#71676b] sm:px-5"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {predictions.map((customer, index) => {
                const prediction = getPrediction(customer.score);

                const initials =
                  customer.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("") || "CU";

                const action =
                  customer.score >= 70
                    ? "Contact"
                    : customer.score >= 40
                      ? "Remind"
                      : "Review";

                return (
                  <tr
                    key={customer.id}
                    className="group border-b border-[#f0eae6] transition hover:bg-[#fcf8f6] dark:border-[#3d3035] dark:hover:bg-[#31262b]"
                  >
                    <td className="px-4 py-2.5 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`grid size-7 place-items-center rounded-full text-[9px] font-bold ${
                            avatarColors[index % avatarColors.length]
                          }`}
                        >
                          {initials}
                        </span>

                        <span className="text-[11px] font-medium text-[#4e4548] dark:text-white">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${prediction.color}`}
                      >
                        {prediction.label}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 text-[11px] font-semibold text-[#51494b] dark:text-white">
                      {money(customer.amount)}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 text-[10px] font-semibold ${
                            customer.score >= 70
                              ? "text-[#39795d]"
                              : customer.score >= 40
                                ? "text-[#b37b16]"
                                : "text-[#b94b55]"
                          }`}
                        >
                          {customer.score}%
                        </span>

                        <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-[#e9e4e1]">
                          <div
                            className={`h-full rounded-full ${
                              customer.score >= 70
                                ? "bg-[#3f8062]"
                                : customer.score >= 40
                                  ? "bg-[#e4a326]"
                                  : "bg-[#d6314a]"
                            }`}
                            style={{
                              width: `${customer.score}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-[10px] text-[#776d71]">
                      {customer.score >= 70
                        ? "Pays regularly · good history"
                        : customer.score >= 40
                          ? "Payment delay · occasional"
                          : "Long delay · poor history"}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            onAction?.(action.toLowerCase(), customer)
                          }
                          className="flex min-w-[88px] items-center justify-center gap-1.5 rounded-md border border-[#bd8790] px-2 py-1.5 text-[10px] font-semibold text-[#7a2633] transition hover:bg-[#7a2633] hover:text-white"
                        >
                          {action === "Contact" ? (
                            <Phone size={12} />
                          ) : action === "Remind" ? (
                            <Mail size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}

                          {action}
                        </button>

                        <button className="grid size-7 place-items-center rounded-md text-[#857b7e] opacity-0 transition hover:bg-[#f3ece8] group-hover:opacity-100">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
