import { useApp } from "../context/AppContext.jsx";
import { Heading, PanelHeading } from "../components/PageParts.jsx";
import { money } from "../utils/calculations.js";
import { paymentPrediction } from "../utils/paymentPrediction.js";
export default function AIInsights() {
  const { customers, totals } = useApp();
  return (
    <Heading eyebrow="RULE-BASED INTELLIGENCE" title="AI Insights">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226]">
          <PanelHeading eyebrow="TRUST SCORES" title="Customer trust" />
          {customers.map((item) => (
            <div
              className="flex items-center justify-between border-b border-[#ebe7e3] py-3 text-sm last:border-0 dark:border-[#423238]"
              key={item.id}
            >
              <span>{item.name}</span>
              <strong>
                {item.score}/100{" "}
                <small className="ml-2 text-xs font-normal text-[#8b8383]">
                  {item.status}
                </small>
              </strong>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226]">
          <PanelHeading eyebrow="RECOMMENDATIONS" title="What to do next" />
          <div className="space-y-4 text-sm text-[#8b8383]">
            <p>
              Focus on recovering{" "}
              <strong className="text-[#2b2528] dark:text-white">
                {money(totals.overdue)}
              </strong>{" "}
              in overdue payments.
            </p>
            <p>
              Average predicted payment probability:{" "}
              <strong className="text-[#2b2528] dark:text-white">
                {paymentPrediction(customers)}%
              </strong>
              .
            </p>
          </div>
        </div>
      </div>
    </Heading>
  );
}
