import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const Icon = ({ children }) => <span className="text-lg leading-none">{children}</span>;

export default function Reports() {
  const { data, customers } = useApp();
  const [range, setRange] = useState("Sep 1, 2026 - Sep 30, 2026");
  const tx = data?.transactions || [];

  const stats = useMemo(() => {
    const received = tx.filter((x) => x.type === "payment" || x.type === "received");
    const given = tx.filter((x) => x.type === "credit" || x.type === "given");

    const totalCollection = received.reduce((s, x) => s + Number(x.amount || 0), 0);
    const moneyGiven = given.reduce((s, x) => s + Number(x.amount || 0), 0);

    return {
      collection: totalCollection,
      given: moneyGiven,
      net: totalCollection - moneyGiven,
      customers: customers?.length || 0,
    };
  }, [tx, customers]);

  const formatMoney = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const getRows = () => [
    ["Customer", "Type", "Amount", "Date"],
    ...tx.map((item) => [
      customers?.find((c) => c.id === item.customerId)?.name || "Unknown",
      item.type || "",
      item.amount || 0,
      item.date || "",
    ]),
  ];

  const downloadFile = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csv = getRows()
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadFile(csv, "text/csv;charset=utf-8;", "khataone-report.csv");
  };

  const exportExcel = () => {
    const table = `
      <table>
        <thead>
          <tr>${getRows()[0].map((x) => `<th>${x}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${getRows()
            .slice(1)
            .map(
              (row) =>
                `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;

    downloadFile(
      table,
      "application/vnd.ms-excel",
      "khataone-report.xls",
    );
  };

  const exportPDF = () => {
    const rows = getRows()
      .slice(1)
      .map(
        (r) => `
        <tr>
          <td>${r[0]}</td>
          <td>${r[1]}</td>
          <td>₹${r[2]}</td>
          <td>${r[3]}</td>
        </tr>`,
      )
      .join("");

    const popup = window.open("", "_blank");

    popup.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>KhataOne Report</title>
        <style>
          body{font-family:Arial;padding:40px;color:#222}
          h1{color:#741f29}
          table{width:100%;border-collapse:collapse;margin-top:25px}
          th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}
          th{background:#741f29;color:#fff}
        </style>
      </head>
      <body>
        <h1>KhataOne Business Report</h1>
        <p>${range}</p>
        <table>
          <thead>
            <tr><th>Customer</th><th>Type</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>
          window.onload=()=>window.print();
        </script>
      </body>
      </html>
    `);

    popup.document.close();
  };

  const daily = [18, 32, 22, 40, 25, 20, 38, 24, 48, 29, 35, 44, 72, 54, 27, 38, 21, 34, 46, 30, 42, 25, 51, 36, 29, 47, 31, 39, 58, 34];
  const monthly = [
    ["Apr", 48, 34],
    ["May", 50, 45],
    ["Jun", 57, 48],
    ["Jul", 53, 43],
    ["Aug", 74, 62],
    ["Sep", 61, 52],
  ];

  const maxDaily = Math.max(...daily);

  const savedReports = [
    ["📄", "Monthly collection summary", "Sep 2026 · PDF · 245 KB"],
    ["📊", "Outstanding customers report", "Sep 2026 · Excel · 180 KB"],
    ["📄", "Top 10 customers", "Sep 2026 · PDF · 320 KB"],
    ["📊", "Yearly summary", "2026 · Excel · 612 KB"],
  ];

  const recentExports = [
    ["Monthly collection summary", "12 Sep 2026", "PDF"],
    ["Outstanding customers", "10 Sep 2026", "Excel"],
    ["Transaction report", "8 Sep 2026", "CSV"],
    ["Top customers", "5 Sep 2026", "PDF"],
    ["Yearly summary", "1 Sep 2026", "Excel"],
  ];

  const cards = [
    {
      icon: "◉",
      value: formatMoney(stats.collection),
      label: "Total Collections",
      growth: "↑ 12%",
      color: "text-emerald-700",
    },
    {
      icon: "◇",
      value: formatMoney(stats.given),
      label: "Money Given",
      growth: "↑ 8%",
      color: "text-[#8a2935]",
    },
    {
      icon: "▣",
      value: formatMoney(stats.net),
      label: "Net Collection",
      growth: "↑ 18%",
      color: "text-indigo-700",
    },
    {
      icon: "♙",
      value: stats.customers || 4,
      label: "Active Customers",
      growth: "↑ 3",
      color: "text-amber-600",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[#272832] sm:text-5xl">
            Reports
          </h1>
          <p className="mt-2 text-sm text-[#697080] sm:text-base">
            Beautiful analytics and one-click exports for your accountant.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-12 min-w-[245px] rounded-xl border border-[#ddd9d5] bg-white px-4 text-sm font-medium text-[#333846] outline-none transition focus:border-[#7d2731]"
          >
            <option>Sep 1, 2026 - Sep 30, 2026</option>
            <option>Aug 1, 2026 - Aug 31, 2026</option>
            <option>Jul 1, 2026 - Jul 31, 2026</option>
          </select>

          <button
            onClick={exportPDF}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#7b202a] px-5 text-sm font-semibold text-white transition hover:bg-[#651923]"
          >
            <Icon>▧</Icon> PDF
          </button>

          <button
            onClick={exportExcel}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8d4d0] bg-white px-5 text-sm font-semibold text-[#333] transition hover:bg-[#f8f6f4]"
          >
            <Icon>▤</Icon> Excel
          </button>

          <button
            onClick={exportCSV}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8d4d0] bg-white px-5 text-sm font-semibold text-[#333] transition hover:bg-[#f8f6f4]"
          >
            <Icon>⇩</Icon> CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex min-h-[92px] items-center gap-4 rounded-2xl border border-[#e1ddd8] bg-white p-4 shadow-[0_2px_8px_rgba(40,30,20,.04)]"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#f5f3f1] text-xl ${card.color}`}>
              {card.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <strong className="truncate text-xl text-[#30323b]">
                  {card.value}
                </strong>
                <span className="whitespace-nowrap text-xs font-semibold text-emerald-700">
                  {card.growth}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#737887]">{card.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid gap-4 xl:grid-cols-2">
        {/* Daily Collection */}
        <div className="rounded-2xl border border-[#dfdbd6] bg-white p-5 shadow-[0_2px_8px_rgba(40,30,20,.04)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#30323b]">
                Daily Collection
              </h2>
              <p className="mt-1 text-sm text-[#747987]">
                Amount collected each day this month
              </p>
            </div>

            <select className="h-10 rounded-lg border border-[#dedad6] bg-white px-3 text-sm outline-none">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div className="flex h-[210px] items-end gap-[5px] border-b border-[#cfcac5] px-2">
            {daily.map((value, index) => (
              <div
                key={index}
                className="group relative flex h-full flex-1 items-end"
              >
                <div
                  className="w-full rounded-t bg-[#8b3d47] transition hover:bg-[#741f2a]"
                  style={{ height: `${(value / maxDaily) * 90}%` }}
                  title={`Day ${index + 1}: ₹${value * 100}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-between px-4 text-xs text-[#737887]">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
            <span>25</span>
            <span>30</span>
          </div>
        </div>

        {/* Collection vs Money */}
        <div className="rounded-2xl border border-[#dfdbd6] bg-white p-5 shadow-[0_2px_8px_rgba(40,30,20,.04)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#30323b]">
                Collection vs Money Given
              </h2>
              <p className="mt-1 text-sm text-[#747987]">
                Compare money collected and given
              </p>
            </div>

            <div className="flex gap-4 text-xs text-[#697080]">
              <span className="flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-[#40866b]" />
                Collection
              </span>
              <span className="flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-[#76232d]" />
                Money Given
              </span>
            </div>
          </div>

          <div className="flex h-[210px] items-end justify-around border-b border-[#cfcac5] px-4">
            {monthly.map(([month, collection, given]) => (
              <div
                className="flex h-full flex-1 flex-col items-center justify-end"
                key={month}
              >
                <div className="flex h-[180px] items-end gap-1.5">
                  <div
                    className="w-5 rounded-t bg-[#40866b] sm:w-7"
                    style={{ height: `${collection * 2.1}px` }}
                  />
                  <div
                    className="w-5 rounded-t bg-[#76232d] sm:w-7"
                    style={{ height: `${given * 2.1}px` }}
                  />
                </div>
                <span className="mt-2 text-xs text-[#697080]">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Reports */}
        <div className="overflow-hidden rounded-2xl border border-[#dfdbd6] bg-white shadow-[0_2px_8px_rgba(40,30,20,.04)]">
          <div className="flex items-center justify-between border-b border-[#ece8e4] px-5 py-4">
            <h2 className="text-lg font-bold text-[#30323b]">Saved reports</h2>
            <button className="text-sm font-medium text-[#7b202a]">
              View All →
            </button>
          </div>

          {savedReports.map(([icon, title, sub]) => (
            <div
              key={title}
              className="flex items-center gap-3 border-b border-[#eeeae6] px-5 py-3 last:border-0"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5f3f1]">
                {icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#343640]">
                  {title}
                </p>
                <p className="mt-1 text-xs text-[#777d89]">{sub}</p>
              </div>

              <button
                onClick={exportCSV}
                className="rounded-lg border border-[#dedad6] px-3 py-2 text-xs font-semibold text-[#7b202a] hover:bg-[#faf6f6]"
              >
                Download
              </button>

              <button className="hidden text-lg sm:block">⋮</button>
            </div>
          ))}
        </div>

        {/* Recent Exports */}
        <div className="overflow-hidden rounded-2xl border border-[#dfdbd6] bg-white shadow-[0_2px_8px_rgba(40,30,20,.04)]">
          <div className="flex items-center justify-between border-b border-[#ece8e4] px-5 py-4">
            <h2 className="text-lg font-bold text-[#30323b]">Recent exports</h2>
            <button className="text-sm font-medium text-[#7b202a]">
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="border-b border-[#ece8e4] text-xs text-[#747987]">
                <tr>
                  <th className="px-5 py-3 font-medium">Report Name</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Format</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentExports.map(([name, date, format]) => (
                  <tr
                    key={name}
                    className="border-b border-[#f0ece8] last:border-0"
                  >
                    <td className="px-5 py-3 text-[#3d4049]">{name}</td>
                    <td className="px-3 py-3 text-[#697080]">{date}</td>
                    <td className="px-3 py-3 text-[#697080]">{format}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 text-emerald-700">
                        <i className="h-2 w-2 rounded-full bg-emerald-700" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}