import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/useApp.js";
import { getAIInsights } from "../services/aiService.js";

import {
  AlertTriangle,
  Bell,
  Bot,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coins,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const money = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const amountOf = (customer) =>
  Number(
    customer?.outstanding ??
      customer?.balance ??
      customer?.pendingAmount ??
      0,
  );

const paymentTypes = ["payment", "received", "collection", "income"];

export default function AIInsights({ onAction }) {
  const { customers = [], data } = useApp();
  const navigate = useNavigate();

  const transactions = data?.transactions || [];
  const userName =
    data?.profile?.name?.trim()?.split(/\s+/)?.[0] || "Samir";

  const [period, setPeriod] = useState("Weekly");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(
    "Ask me about pending payments, customer risk, collections or your business.",
  );
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (!customers.length) {
      setAiData(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setAiLoading(true);
        setAiError("");
        const result = await getAIInsights(customers, transactions);
        if (active) setAiData(result);
      } catch (error) {
        console.error("AI Insights error:", error);
        if (active) setAiError("AI analysis is unavailable right now.");
      } finally {
        if (active) setAiLoading(false);
      }
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customers, transactions]);

  /* =========================
     LIVE BUSINESS DATA
  ========================== */

  const stats = useMemo(() => {
    const pending = customers.filter((item) => amountOf(item) > 0);

    const totalPending = pending.reduce(
      (sum, item) => sum + amountOf(item),
      0,
    );

    const collected = transactions
      .filter((item) =>
        paymentTypes.includes(String(item?.type || "").toLowerCase()),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const overdueCustomers = pending.filter(
      (item) => Array.isArray(item.overdue) && item.overdue.length > 0,
    );

    const overdueAmount = overdueCustomers.reduce(
      (sum, item) =>
        sum + Number(item.overdueAmount || amountOf(item)),
      0,
    );

    const collectionRate =
      totalPending + collected > 0
        ? Math.round((collected / (totalPending + collected)) * 100)
        : 0;

    const avgRisk =
      pending.length > 0
        ? Math.round(
            pending.reduce(
              (sum, item) => sum + Number(item.score || 50),
              0,
            ) / pending.length,
          )
        : 0;

    const health =
      pending.length === 0 && collected === 0
        ? 0
        : Math.max(
            0,
            Math.min(
              100,
              Math.round(collectionRate * 0.65 + avgRisk * 0.35),
            ),
          );

    return {
      totalPending,
      pendingCustomers: pending.length,
      collected,
      overdueAmount,
      overdueCustomers: overdueCustomers.length,
      collectionRate,
      health,
    };
  }, [customers, transactions]);

  /* =========================
     CUSTOMER PREDICTIONS
  ========================== */

  const predictions = useMemo(
    () =>
      [...customers]
        .filter((customer) => amountOf(customer) > 0)
        .sort(
          (a, b) =>
            Number(a.score || 50) - Number(b.score || 50),
        )
        .map((customer) => {
          const aiPrediction = aiData?.paymentPredictions?.find(
            (item) => item.customerId === customer.id,
          );
          const score = Math.max(
            0,
            Math.min(100, Number(aiPrediction?.trustScore ?? aiPrediction?.probability ?? customer.score ?? 50)),
          );

          return {
            ...customer,
            amount: amountOf(customer),
            score,
            overdueDays: Array.isArray(customer.overdue)
              ? customer.overdue.length * 10
              : 0,
          };
        }),
    [customers, aiData],
  );

  /* =========================
     PREDICTION SUMMARY
  ========================== */

  const summary = useMemo(() => {
    const high = predictions.filter((item) => item.score >= 70);
    const medium = predictions.filter(
      (item) => item.score >= 40 && item.score < 70,
    );
    const low = predictions.filter((item) => item.score < 40);

    const sum = (items) =>
      items.reduce((total, item) => total + item.amount, 0);

    return {
      high: sum(high),
      medium: sum(medium),
      low: sum(low),
      highCount: high.length,
      mediumCount: medium.length,
      lowCount: low.length,
    };
  }, [predictions]);

  /* =========================
     COLLECTION TREND
  ========================== */

  const trendData = useMemo(() => {
    const now = new Date();

    if (period === "Monthly") {
      return Array.from({ length: 6 }, (_, index) => {
        const month = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1,
        );

        const rows = transactions.filter((item) => {
          const date = getDate(item.date);
          return (
            date &&
            date.getFullYear() === month.getFullYear() &&
            date.getMonth() === month.getMonth()
          );
        });

        return {
          month: month.toLocaleDateString("en-IN", {
            month: "short",
          }),
          collected: rows
            .filter((item) =>
              paymentTypes.includes(
                String(item.type || "").toLowerCase(),
              ),
            )
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
          pending: rows
            .filter((item) =>
              ["credit", "sale"].includes(
                String(item.type || "").toLowerCase(),
              ),
            )
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        };
      });
    }

    return Array.from({ length: 6 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (5 - index));

      const key = day.toDateString();

      const rows = transactions.filter((item) => {
        const date = getDate(item.date);
        return date?.toDateString() === key;
      });

      return {
        month: day.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        collected: rows
          .filter((item) =>
            paymentTypes.includes(
              String(item.type || "").toLowerCase(),
            ),
          )
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        pending: rows
          .filter((item) =>
            ["credit", "sale"].includes(
              String(item.type || "").toLowerCase(),
            ),
          )
          .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      };
    });
  }, [transactions, period]);

  /* =========================
     AI SUGGESTIONS
  ========================== */

  const suggestions = useMemo(() => {
    const result = [];

    predictions
      .filter((item) => item.score < 40)
      .slice(0, 2)
      .forEach((customer) =>
        result.push({
          icon: TrendingDown,
          title: `Review ${customer.name}`,
          text: "Payment behavior needs attention",
          score: customer.score,
          tone: "red",
          customer,
          action: "review",
        }),
      );

    predictions
      .filter((item) => item.overdueDays > 0)
      .slice(0, 2)
      .forEach((customer) =>
        result.push({
          icon: Mail,
          title: `Follow up with ${customer.name}`,
          text: `${customer.overdueDays}+ days overdue`,
          score: customer.score,
          tone: "amber",
          customer,
          action: "remind",
        }),
      );

    const likely = predictions.find((item) => item.score >= 70);

    if (likely) {
      result.push({
        icon: Phone,
        title: `Contact ${likely.name}`,
        text: "High chance of payment",
        score: likely.score,
        tone: "green",
        customer: likely,
        action: "contact",
      });
    }

    if (stats.pendingCustomers > 0) {
      result.push({
        icon: Bell,
        title: `Send reminder to ${stats.pendingCustomers} customers`,
        text: `${money(stats.totalPending)} is pending`,
        score: stats.collectionRate,
        tone: stats.collectionRate >= 70 ? "green" : "amber",
        action: "remind-all",
      });
    }

    return result;
  }, [predictions, stats]);

  /* =========================
     AI ANSWER ENGINE
  ========================== */

  const answerQuestion = async (text) => {
    const q = String(text || "").trim();
    if (!q) return;

    setQuery(q);
    setAiLoading(true);
    setAiError("");

    try {
      const result = await getAIInsights(customers, transactions);
      setAiData(result);

      const answer = result?.answers?.[q] || result?.answer || result?.summary;
      if (answer) setAnswer(answer);
      else setAnswer(result?.summary || "AI analysis completed.");
    } catch (error) {
      console.error("AI question error:", error);
      setAiError("AI could not answer right now. Please try again.");
      setAnswer("AI analysis is temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }

    onAction?.("ai-query", q);
  };
  const handleSubmit = () => {
    if (query.trim()) answerQuestion(query);
  };

  /* =========================
     CUSTOMER ACTIONS
  ========================== */

  const handleCustomerAction = (action, customer) => {
    if (action === "remind-all") {
      navigate("/collections");
      return;
    }

    if (!customer) return;

    if (action === "contact") {
      if (customer.phone) {
        window.open(`tel:${customer.phone}`, "_self");
      } else {
        navigate(`/customers/${customer.id}`);
      }
      return;
    }

    if (action === "remind") {
      navigate("/collections");
      return;
    }

    navigate(`/customers/${customer.id}`);
  };

  /* =========================
     GRAPH
  ========================== */

  const maxTrend = Math.max(
    ...trendData.map((item) =>
      Math.max(item.collected, item.pending),
    ),
    1,
  );

  const getX = (index) =>
    45 +
    (index * 535) /
      Math.max(trendData.length - 1, 1);

  const getY = (value) =>
    178 - (Number(value || 0) / maxTrend) * 130;

  const createPath = (key) =>
    trendData
      .map(
        (item, index) =>
          `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(item[key])}`,
      )
      .join(" ");

  const collectedPath = createPath("collected");
  const pendingPath = createPath("pending");

  const visibleSuggestions = showAllSuggestions
    ? suggestions
    : suggestions.slice(0, 4);

  const getPrediction = (score) => {
    if (score >= 70)
      return {
        label: "High",
        color:
          "bg-[#e6f3eb] text-[#39795d] border-[#cce4d6]",
      };

    if (score >= 40)
      return {
        label: "Medium",
        color:
          "bg-[#fff5dd] text-[#a47716] border-[#f1ddb0]",
      };

    return {
      label: "Low",
      color:
        "bg-[#fcebed] text-[#b84b59] border-[#f1cbd1]",
    };
  };

  const toneStyle = {
    green: "bg-[#e9f4ed] text-[#3f8062]",
    amber: "bg-[#fff4dd] text-[#a97715]",
    red: "bg-[#f9e9eb] text-[#b94b55]",
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">

      {/* HEADER */}
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

      {/* AI + HEALTH */}
      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">

        {/* AI ASSISTANT */}
        <section className="overflow-hidden rounded-[20px] border border-[#e4ddd5] bg-gradient-to-br from-[#fff9f7] via-[#fffdfb] to-[#f8f1ed] p-4 shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:from-[#2d2327] dark:via-[#2a2024] dark:to-[#32272b] sm:p-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-[18px] bg-[#f2dce0] blur-lg" />

              <div className="relative grid h-[76px] w-[76px] place-items-center rounded-[18px] border border-[#ead9d8] bg-white shadow-sm dark:border-[#513a41] dark:bg-[#35282d]">
                <Bot
                  size={40}
                  strokeWidth={1.5}
                  className="text-[#7a2633]"
                />

                <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#45966d]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[17px] font-bold tracking-tight text-[#423238] dark:text-white">
                  Hello {userName}! 👋
                </h2>

                <span className="rounded-full bg-[#edf5ef] px-2 py-[3px] text-[8px] font-semibold text-[#438464]">
                  AI Online
                </span>
              </div>

              <p className="mt-1 max-w-[470px] text-[11px] leading-[18px] text-[#71676b] dark:text-[#b9adb1]">
                I analyze your live customers, pending payments, collection performance and payment behavior.
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-[#eaded9] bg-white/70 px-3 py-2.5 text-[11px] leading-5 text-[#655b5e] dark:border-[#49383e] dark:bg-[#30262b] dark:text-[#d5c8cc]">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#7a2633]">
              <Sparkles size={11} />
              AI response
            </div>
            {answer}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              "How much money is overdue?",
              "Who should I contact today?",
              "Which customer is most risky?",
              "Show this week's collection summary",
            ].map((item) => (
              <button
                key={item}
                onClick={() => answerQuestion(item)}
                className="flex min-h-[40px] items-center rounded-[20px] border border-[#e2d9d4] bg-white px-3 text-left text-[11px] font-medium text-[#655b5e] transition hover:border-[#a35a67] hover:bg-[#fff9f8] hover:text-[#7a2633] dark:border-[#49383e] dark:bg-[#30262b] dark:text-[#d5c8cc]"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-3 flex min-h-[46px] items-center gap-2 rounded-[13px] border border-[#ddd3ce] bg-white px-2 shadow-[0_2px_6px_rgba(73,48,35,0.06)] dark:border-[#49383e] dark:bg-[#30262b]">
            <Sparkles size={14} className="ml-1 shrink-0 text-[#8f2039]" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Ask anything about your business..."
              className="min-w-0 flex-1 bg-transparent px-1 text-[11px] text-[#4e4548] outline-none placeholder:text-[#a49a9c] dark:text-white"
            />

            <button
              onClick={handleSubmit}
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] bg-[#8f2039] text-white transition hover:bg-[#741c31] active:scale-95"
            >
              <Send size={14} />
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
            <div
              className="grid h-[128px] w-[128px] shrink-0 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#3f8062 ${stats.health * 3.6}deg, #ebe7e3 ${stats.health * 3.6}deg)`,
              }}
            >
              <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-[#fffdf9] dark:bg-[#2b2226]">
                <div className="text-center">
                  <strong className="block text-[27px] text-[#423238] dark:text-white">
                    {aiData?.businessHealth ?? stats.health}
                  </strong>

                  <span className="text-[10px] text-[#91868a]">
                    / 100
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden max-w-[145px] md:block">
              <p className="flex items-center gap-1 text-[16px] font-bold text-[#3f8062]">
                <TrendingUp size={17} />

                {stats.health >= 70
                  ? "Healthy"
                  : stats.health >= 45
                    ? "Needs attention"
                    : "At risk"}
              </p>

              <p className="mt-2 text-[11px] leading-4 text-[#766d70]">
                {stats.pendingCustomers
                  ? `${stats.pendingCustomers} customers currently have pending amounts.`
                  : "No pending customers right now."}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              [CircleDollarSign, money(stats.totalPending), "Total Due"],
              [Users, stats.pendingCustomers, "Pending Customers"],
              [TrendingUp, `${stats.collectionRate}%`, "Collection Rate"],
              [AlertTriangle, money(stats.overdueAmount), "Overdue"],
            ].map(([Icon, value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-[#ebe4df] bg-[#fffaf7] p-2.5 dark:border-[#493b40] dark:bg-[#32272b]"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#f8e9eb] text-[#8f2039]">
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

      {/* COLLECTION TREND + AI SUGGESTIONS */}
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

          <div className="mt-3 h-[220px] sm:h-[240px]">
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
                    />

                    <text
                      x="5"
                      y={y + 4}
                      fontSize="10"
                      fill="#8e8588"
                    >
                      {Math.round(
                        (maxTrend * (4 - i)) / 4 / 1000,
                      )}
                      k
                    </text>
                  </g>
                );
              })}

              {trendData.map((item, i) => (
                <line
                  key={`${item.month}-${i}`}
                  x1={getX(i)}
                  x2={getX(i)}
                  y1="18"
                  y2="178"
                  stroke="#f1ece8"
                />
              ))}

              <path
                d={collectedPath}
                fill="none"
                stroke="#3f8062"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={pendingPath}
                fill="none"
                stroke="#c92f47"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {trendData.map((item, i) => (
                <g key={`${item.month}-point-${i}`}>
                  <circle
                    cx={getX(i)}
                    cy={getY(item.collected)}
                    r="4"
                    fill="#3f8062"
                  />

                  <circle
                    cx={getX(i)}
                    cy={getY(item.pending)}
                    r="4"
                    fill="#c92f47"
                  />

                  <text
                    x={getX(i)}
                    y="208"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#81777a"
                  >
                    {item.month}
                  </text>
                </g>
              ))}
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

            {suggestions.length > 4 && (
              <button
                onClick={() =>
                  setShowAllSuggestions((value) => !value)
                }
                className="text-[11px] font-semibold text-[#8f2039] hover:underline"
              >
                {showAllSuggestions ? "Show Less" : "View All"}
              </button>
            )}
          </div>

          {visibleSuggestions.length > 0 ? (
            <div className="mt-3 divide-y divide-[#eee7e2] dark:divide-[#423238]">
              {visibleSuggestions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={`${item.title}-${index}`}
                    onClick={() =>
                      handleCustomerAction(
                        item.action,
                        item.customer,
                      )
                    }
                    className="group flex w-full items-center gap-3 py-3 text-left transition hover:px-1"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneStyle[item.tone]}`}
                    >
                      <Icon size={17} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[12px] text-[#494043] dark:text-white">
                        {item.title}
                      </strong>

                      <small className="mt-0.5 block truncate text-[10px] text-[#857b7e]">
                        {item.text}
                      </small>
                    </span>

                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                        item.score >= 70
                          ? "border-[#b9dac7] bg-[#edf7f0] text-[#39795d]"
                          : item.score >= 40
                            ? "border-[#efd6a1] bg-[#fff8e8] text-[#a47716]"
                            : "border-[#edc3ca] bg-[#fff0f1] text-[#b94b55]"
                      }`}
                    >
                      {item.score}%
                    </span>

                    <ChevronRight
                      size={15}
                      className="shrink-0 text-[#aaa0a2] transition group-hover:translate-x-1"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-[#e2d8d3] py-7 text-center text-[11px] text-[#93898c]">
              No AI suggestions right now.
            </div>
          )}
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

          <span className="text-[11px] font-medium text-[#8f2039]">
            {aiLoading ? "AI analyzing…" : aiError ? "AI unavailable" : "Live AI analysis"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            {
              icon: Coins,
              title: "High probability",
              value: summary.high,
              subtitle: `${summary.highCount} customers likely to pay`,
              box: "border-[#d4e9da] bg-[#f1f8f3]",
              iconBox: "bg-[#d6ebdc] text-[#3f8062]",
              valueColor: "text-[#2f674f]",
            },
            {
              icon: Clock3,
              title: "Medium probability",
              value: summary.medium,
              subtitle: `${summary.mediumCount} customers may require follow-up`,
              box: "border-[#f0e1b7] bg-[#fffaf0]",
              iconBox: "bg-[#ffefc6] text-[#c88a15]",
              valueColor: "text-[#55462a]",
            },
            {
              icon: AlertTriangle,
              title: "Low probability",
              value: summary.low,
              subtitle: `${summary.lowCount} customers need attention`,
              box: "border-[#f0d2d5] bg-[#fff5f6]",
              iconBox: "bg-[#f9dce0] text-[#c52e47]",
              valueColor: "text-[#b3293f]",
            },
          ].map(
            ({
              icon: Icon,
              title,
              value,
              subtitle,
              box,
              iconBox,
              valueColor,
            }) => (
              <div
                key={title}
                className={`flex items-center gap-3 rounded-xl border p-4 ${box}`}
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconBox}`}
                >
                  <Icon size={21} />
                </span>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#655b5f]">
                    {title}
                  </p>

                  <strong
                    className={`mt-1 block truncate text-[22px] font-bold ${valueColor}`}
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

      {/* CUSTOMER PREDICTION */}
      <section className="overflow-hidden rounded-[20px] border border-[#e4ddd5] bg-[#fffdf9] shadow-[0_5px_18px_rgba(73,48,35,0.05)] dark:border-[#423238] dark:bg-[#2b2226]">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Users size={19} className="text-[#8f2039]" />

            <h2 className="text-[17px] font-bold text-[#423238] dark:text-white">
              Customer-wise Prediction
            </h2>
          </div>

          <span className="text-[10px] text-[#8c8184]">
            {predictions.length} customers analyzed
          </span>
        </div>

        {predictions.length > 0 ? (
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
                      ?.split(/\s+/)
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "CU";

                  const action =
                    customer.score >= 70
                      ? "Contact"
                      : customer.score >= 40
                        ? "Remind"
                        : "Review";

                  return (
                    <tr
                      key={customer.id || index}
                      className="group border-b border-[#f0eae6] transition hover:bg-[#fcf8f6] dark:border-[#3d3035] dark:hover:bg-[#31262b]"
                    >
                      <td className="px-4 py-2.5 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#f7e5e6] text-[9px] font-bold text-[#8f2039]">
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
                        {aiData?.paymentPredictions?.find((item) => item.customerId === customer.id)?.reason ||
                          (customer.score >= 70
                            ? "Pays regularly · good history"
                            : customer.score >= 40
                              ? "Payment delay · occasional"
                              : "Long delay · poor history")}
                      </td>

                      <td className="px-4 py-2.5">
                        <button
                          onClick={() =>
                            handleCustomerAction(
                              action === "Contact"
                                ? "contact"
                                : action === "Remind"
                                  ? "remind"
                                  : "review",
                              customer,
                            )
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-t border-[#ece5e0] px-5 py-10 text-center">
            <Bot size={28} className="mx-auto text-[#c9b8bc]" />

            <p className="mt-2 text-sm font-medium text-[#655b5e]">
              No customer data available
            </p>

            <p className="mt-1 text-[11px] text-[#93898c]">
              Add customers and transactions to start AI analysis.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}