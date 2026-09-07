import { useMemo, useState } from "react";
import {
  Sparkles,
  Send,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { money } from "../utils/calculations.js";

export default function AIInsights() {
  const { customers = [], totals = {} } = useApp();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Hi Samir — ask me anything about your customers, pending money or collections.",
  );

  const predictions = useMemo(() => {
    return customers.map((customer) => {
      const score = Number(customer.score || 50);
      const outstanding = Number(customer.outstanding || 0);
      const overdueDays = Array.isArray(customer.overdue)
        ? customer.overdue.length * 10
        : 0;

      const probability = Math.max(
        5,
        Math.min(
          98,
          Math.round(
            score * 0.65 +
              (customer.payments > 0 ? 15 : 0) -
              overdueDays * 0.7,
          ),
        ),
      );

      return {
        ...customer,
        outstanding,
        probability,
        overdueDays,
        reminders:
          probability < 40 ? 3 : probability < 70 ? 2 : probability < 90 ? 1 : 0,
      };
    });
  }, [customers]);

  const totalHigh = predictions
    .filter((item) => item.probability >= 70)
    .reduce((sum, item) => sum + item.outstanding, 0);

  const totalMedium = predictions
    .filter((item) => item.probability >= 40 && item.probability < 70)
    .reduce((sum, item) => sum + item.outstanding, 0);

  const totalLow = predictions
    .filter((item) => item.probability < 40)
    .reduce((sum, item) => sum + item.outstanding, 0);

  const avgProbability = predictions.length
    ? Math.round(
        predictions.reduce((sum, item) => sum + item.probability, 0) /
          predictions.length,
      )
    : 0;

  const totalOutstanding =
    totals.receivable ||
    customers.reduce(
      (sum, customer) => sum + Number(customer.outstanding || 0),
      0,
    );

  const overdueAmount =
    totals.overdue ||
    predictions
      .filter((item) => item.overdueDays > 0)
      .reduce((sum, item) => sum + item.outstanding, 0);

  const healthScore = Math.max(
    20,
    Math.min(
      98,
      Math.round(
        avgProbability * 0.65 +
          (totalOutstanding
            ? (1 - overdueAmount / totalOutstanding) * 35
            : 35),
      ),
    ),
  );

  const quickQuestions = [
    "How much money is overdue?",
    "Which customer is most risky?",
    "Who should I contact today?",
    "How much can I expect to collect this week?",
  ];

  const getAIAnswer = (text) => {
    const q = text.toLowerCase();

    const riskyCustomer = [...predictions].sort(
      (a, b) => a.probability - b.probability,
    )[0];

    const bestCustomer = [...predictions].sort(
      (a, b) => b.probability - a.probability,
    )[0];

    if (
      q.includes("overdue") ||
      q.includes("due") ||
      q.includes("pending")
    ) {
      return `Currently ${money(
        overdueAmount,
      )} is overdue. Focus on customers with low trust scores first and send reminders before escalating.`;
    }

    if (q.includes("risky") || q.includes("risk")) {
      return riskyCustomer
        ? `${riskyCustomer.name} appears to be the highest-risk customer with a ${riskyCustomer.probability}% predicted payment probability and ${money(
            riskyCustomer.outstanding,
          )} pending.`
        : "No customer risk data is available yet.";
    }

    if (q.includes("contact") || q.includes("today")) {
      return riskyCustomer
        ? `Contact ${riskyCustomer.name} first. They have ${money(
            riskyCustomer.outstanding,
          )} pending and need immediate follow-up.`
        : "Add customers and transactions to get recommendations.";
    }

    if (
      q.includes("collect") ||
      q.includes("week") ||
      q.includes("expect")
    ) {
      const expected = predictions.reduce(
        (sum, item) => sum + item.outstanding * (item.probability / 100),
        0,
      );

      return `Based on current payment behavior, you have a good chance of collecting approximately ${money(
        expected * 0.55,
      )} in the coming week.`;
    }

    if (q.includes("best") || q.includes("likely")) {
      return bestCustomer
        ? `${bestCustomer.name} is most likely to pay soon with a ${bestCustomer.probability}% payment probability.`
        : "Not enough data yet.";
    }

    return `I analyzed ${customers.length} customers. Your average predicted payment probability is ${avgProbability}%. You should prioritize recovering ${money(
      overdueAmount,
    )} in overdue payments.`;
  };

  const handleAsk = (text = question) => {
    if (!text.trim()) return;

    setAnswer("Analyzing your collection data...");
    setQuestion("");

    setTimeout(() => {
      setAnswer(getAIAnswer(text));
    }, 500);
  };

  return (
    <div className="mx-auto w-full max-w-[1250px] px-4 py-7 sm:px-6 lg:px-8">
      {/* PAGE HEADER */}
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-[#302b2d] dark:text-white">
          AI Insights
        </h1>

        <p className="mt-1 text-sm text-[#746b6c]">
          KhataOne AI — your intelligent collection assistant.
        </p>
      </div>

      {/* TOP SECTION */}
      <div className="grid gap-6 xl:grid-cols-[1.8fr_0.85fr]">
        {/* AI CHAT */}
        <div className="flex min-h-[475px] flex-col rounded-[22px] border border-[#ddd6cf] bg-white p-6 shadow-[0_10px_30px_rgba(79,45,30,0.06)] dark:border-[#4a3c40] dark:bg-[#2b2226]">
          <div className="flex items-center gap-2">
            <Sparkles size={21} className="text-[#7c2735]" />

            <h2 className="text-lg font-semibold text-[#342e30] dark:text-white">
              KhataOne AI
            </h2>
          </div>

          {/* AI MESSAGE */}
          <div className="mt-4 max-w-[390px] rounded-[24px] bg-[#f2efeb] px-4 py-3.5 text-sm leading-6 text-[#554e50] dark:bg-[#352b2f] dark:text-[#d8d1d1]">
            {answer}
          </div>

          <div className="flex-1" />

          {/* QUICK QUESTIONS */}
          <div className="mb-3 flex flex-wrap gap-2">
            {quickQuestions.map((item) => (
              <button
                key={item}
                onClick={() => handleAsk(item)}
                className="rounded-full border border-[#ded8d2] bg-white px-3 py-2 text-xs text-[#554d4f] transition hover:border-[#7c2735] hover:text-[#7c2735] dark:bg-[#2b2226]"
              >
                {item}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleAsk();
              }}
              placeholder="Ask about your business..."
              className="min-w-0 flex-1 rounded-xl border border-[#dcd5cf] bg-white px-4 py-3 text-sm text-[#302b2d] outline-none transition placeholder:text-[#9b9291] focus:border-[#7c2735] dark:bg-[#2b2226] dark:text-white"
            />

            <button
              onClick={() => handleAsk()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7c2735] text-white transition hover:bg-[#651d2a] active:scale-95"
              aria-label="Send question"
            >
              <Send size={19} />
            </button>
          </div>
        </div>

        {/* BUSINESS HEALTH */}
        <div className="rounded-[22px] border border-[#ddd6cf] bg-white p-6 shadow-[0_10px_30px_rgba(79,45,30,0.06)] dark:border-[#4a3c40] dark:bg-[#2b2226]">
          <h2 className="text-lg font-semibold text-[#342e30] dark:text-white">
            Business health
          </h2>

          {/* SCORE */}
          <div className="mt-2 flex flex-col items-center">
            <div
              className="relative mt-1 flex h-32 w-32 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#438968 ${
                  healthScore * 3.6
                }deg, #ebe7e2 0deg)`,
              }}
            >
              <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-white dark:bg-[#2b2226]">
                <strong className="text-2xl text-[#342e30] dark:text-white">
                  {healthScore}
                </strong>

                <span className="text-[10px] text-[#817879]">/ 100</span>
              </div>
            </div>

            <span className="mt-3 text-sm font-medium text-[#438968]">
              {healthScore >= 70
                ? "Healthy"
                : healthScore >= 45
                  ? "Needs attention"
                  : "At risk"}
            </span>
          </div>

          {/* MINI TREND */}
          <div className="mt-12 px-2">
            <svg
              viewBox="0 0 280 70"
              className="h-[70px] w-full overflow-visible"
            >
              <polyline
                fill="none"
                stroke="#762936"
                strokeWidth="2.5"
                points="5,55 35,45 65,35 95,28 125,20 150,18 175,5 195,0 215,5"
              />
            </svg>

            <div className="flex justify-between px-4 text-[10px] text-[#777071]">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-[#766d6e]">
            Your pending payments increased by{" "}
            <strong className="font-medium text-[#5e4e51]">18%</strong> this
            month. Focus on recovering overdue payments.
          </p>
        </div>
      </div>

      {/* PAYMENT PREDICTION */}
      <div className="mt-6 rounded-[22px] border border-[#ddd6cf] bg-white p-6 shadow-[0_10px_30px_rgba(79,45,30,0.06)] dark:border-[#4a3c40] dark:bg-[#2b2226]">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[#7c2735]" />

          <h2 className="text-lg font-semibold text-[#342e30] dark:text-white">
            Payment prediction
          </h2>
        </div>

        {/* PREDICTION SUMMARY */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PredictionCard
            color="bg-[#438968]"
            title="High probability"
            value={money(totalHigh)}
            valueClass="text-[#438968]"
          />

          <PredictionCard
            color="bg-[#d49a32]"
            title="Medium probability"
            value={money(totalMedium)}
            valueClass="text-[#c48624]"
          />

          <PredictionCard
            color="bg-[#bf4148]"
            title="Low probability"
            value={money(totalLow)}
            valueClass="text-[#bf4148]"
          />
        </div>

        {/* CUSTOMER PREDICTIONS */}
        <div className="mt-6 space-y-5">
          {predictions.length ? (
            predictions
              .sort((a, b) => b.probability - a.probability)
              .map((customer) => (
                <div key={customer.id}>
                  <div className="mb-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <strong className="text-[#3b3537] dark:text-white">
                      {customer.name}
                    </strong>

                    <span className="text-xs text-[#716869]">
                      {customer.probability}% likely ·{" "}
                      {money(customer.outstanding)} · trust{" "}
                      {customer.score || 0}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#e5dfe0]">
                    <div
                      className={`h-full rounded-full ${
                        customer.probability >= 70
                          ? "bg-[#438968]"
                          : customer.probability >= 40
                            ? "bg-[#d49a32]"
                            : "bg-[#7c2735]"
                      }`}
                      style={{ width: `${customer.probability}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#807778]">
                    Factors: {customer.overdueDays || 1} day average delay ·{" "}
                    {customer.payments || 0} successful payments · needs{" "}
                    {customer.reminders} reminder(s)
                  </p>
                </div>
              ))
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <MessageCircle size={30} className="text-[#b8b0af]" />

              <p className="mt-3 text-sm text-[#817879]">
                Add customers and transactions to generate AI predictions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PredictionCard({ color, title, value, valueClass }) {
  return (
    <div className="rounded-[22px] border border-[#ded8d2] bg-[#fffefe] p-4 dark:bg-[#30272b]">
      <div className="flex items-center gap-2 text-sm text-[#51494b] dark:text-[#d6ced0]">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {title}
      </div>

      <strong className={`mt-2 block text-xl ${valueClass}`}>{value}</strong>
    </div>
  );
}