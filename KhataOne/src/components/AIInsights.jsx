import { Sparkles } from "lucide-react";

export default function AIInsights({ risky = [], likely = [], money }) {
  const insights = [
    {
      title: "Expected collection this week",
      color: "text-[#4d8b70]",
      text: `${money(48500)} across 6 customers.`,
      detail: `${money(32000)} is high probability.`,
    },
    {
      title: "Pending payments rising",
      color: "text-[#bd8a36]",
      text: "Your pending amount increased by 18% compared to last month.",
      detail: "",
    },
    {
      title: "Cash flow prediction",
      color: "text-[#557b9c]",
      text: `At the current pace you will close September with ${money(74000)} collected.`,
      detail: "",
    },
  ];

  return (
    <section className="rounded-[22px] border border-[#e4ddd5] bg-[#fffdf9] p-5 shadow-[0_4px_14px_rgba(73,48,35,0.04)] dark:border-[#423238] dark:bg-[#2b2226] md:p-6">
      
      {/* Heading */}
      <div className="mb-5 flex items-center gap-2">
        <Sparkles
          size={18}
          strokeWidth={1.8}
          className="text-[#7a2633]"
        />

        <h2 className="text-[17px] font-semibold text-[#423238] dark:text-white">
          AI insights
        </h2>
      </div>

      {/* Insight Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {insights.map((item) => (
          <article
            key={item.title}
            className="min-h-[104px] rounded-[20px] border border-[#e4ddd5] bg-[#fffdfa] p-4 transition hover:shadow-sm dark:border-[#493b40] dark:bg-[#33282c]"
          >
            <strong
              className={`block text-[12px] font-semibold ${item.color}`}
            >
              {item.title}
            </strong>

            <p className="mt-3 text-[12px] leading-[1.55] text-[#756d70] dark:text-[#b9adb1]">
              {item.text}
            </p>

            {item.detail && (
              <p className="mt-1 text-[12px] leading-[1.55] text-[#756d70] dark:text-[#b9adb1]">
                {item.detail}
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Customer Lists */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        
        {/* High Risk */}
        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-[#51494b] dark:text-white">
            High-risk customers
          </h3>

          <div className="space-y-2">
            {risky.length > 0 ? (
              risky.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[18px] border border-[#e4ddd5] bg-[#fffdfa] px-4 py-3 dark:border-[#493b40] dark:bg-[#33282c]"
                >
                  <strong className="text-[12px] font-medium text-[#51494b] dark:text-white">
                    {item.name}
                  </strong>

                  <span className="text-[12px] font-medium text-[#bd5960]">
                    {item.score}/100 · {money(item.outstanding)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#e4ddd5] px-4 py-3 text-center text-xs text-[#8b8383]">
                No high-risk customers
              </div>
            )}
          </div>
        </div>

        {/* Likely To Pay */}
        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-[#51494b] dark:text-white">
            Likely to pay soon
          </h3>

          <div className="space-y-2">
            {likely.length > 0 ? (
              likely.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[18px] border border-[#e4ddd5] bg-[#fffdfa] px-4 py-3 dark:border-[#493b40] dark:bg-[#33282c]"
                >
                  <strong className="text-[12px] font-medium text-[#51494b] dark:text-white">
                    {item.name}
                  </strong>

                  <span className="text-[12px] font-medium text-[#438464]">
                    {item.score}% likely
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-[#e4ddd5] px-4 py-3 text-center text-xs text-[#8b8383]">
                No customers available
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}