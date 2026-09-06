import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Search, Phone } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Customers() {
  const { customers } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All personalities");
  const [sort, setSort] = useState("Pending amount");

  const items = useMemo(() => {
    let result = [...customers];

    if (query.trim()) {
      const search = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.phone?.toLowerCase().includes(search),
      );
    }

    if (filter === "High Risk") {
      result = result.filter((item) => Number(item.score) < 50);
    }

    if (filter === "Bulk Payer") {
      result = result.filter(
        (item) => Number(item.score) >= 50 && Number(item.score) < 85,
      );
    }

    if (filter === "Reliable Payer") {
      result = result.filter((item) => Number(item.score) >= 85);
    }

    if (sort === "Pending amount") {
      result.sort(
        (a, b) => Number(b.outstanding || 0) - Number(a.outstanding || 0),
      );
    }

    if (sort === "Highest score") {
      result.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
    }

    if (sort === "Lowest score") {
      result.sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
    }

    return result;
  }, [customers, query, filter, sort]);

  const totalOutstanding = customers.reduce(
    (sum, item) => sum + Number(item.outstanding || 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight text-[#302a2b] dark:text-white">
            Customers
          </h1>

          <p className="mt-1 text-sm text-[#756d70]">
            {customers.length} customers · ₹
            {totalOutstanding.toLocaleString("en-IN")} outstanding
          </p>
        </div>

        <button
          onClick={() => navigate("/customers/new")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#70202d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5d1824] active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={2.2} />
          Add customer
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_190px_200px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756d70]"
          />

          <input
            type="text"
            placeholder="Search by name or mobile"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#ddd5d0] bg-white pl-11 pr-4 text-sm text-[#40393b] outline-none transition placeholder:text-[#8f8789] focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10 dark:border-[#423238] dark:bg-[#2b2226] dark:text-white"
          />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-[#ddd5d0] bg-white px-4 pr-10 text-sm text-[#40393b] outline-none focus:border-[#8f2039] dark:border-[#423238] dark:bg-[#2b2226] dark:text-white"
          >
            <option>All personalities</option>
            <option>High Risk</option>
            <option>Bulk Payer</option>
            <option>Reliable Payer</option>
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756d70]"
          />
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-[#ddd5d0] bg-white px-4 pr-10 text-sm text-[#40393b] outline-none focus:border-[#8f2039] dark:border-[#423238] dark:bg-[#2b2226] dark:text-white"
          >
            <option>Pending amount</option>
            <option>Highest score</option>
            <option>Lowest score</option>
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#756d70]"
          />
        </div>
      </div>

      {/* Customer Cards */}
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onClick={() => navigate(`/customers/${customer.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ddd5d0] bg-white p-10 dark:border-[#423238] dark:bg-[#2b2226]">
          <EmptyState text="No customers found." />
        </div>
      )}
    </div>
  );
}

function CustomerCard({ customer, onClick }) {
  const score = Number(customer.score ?? 50);
  const outstanding = Number(customer.outstanding ?? 0);

  const personality =
    score < 50
      ? {
          label: "High Risk",
          dot: "bg-[#c64045]",
          text: "text-[#b5484e]",
          score: "text-[#b5484e]",
        }
      : score < 85
        ? {
            label: "Bulk Payer",
            dot: "bg-[#3f7a9c]",
            text: "text-[#4b7187]",
            score: "text-[#b38223]",
          }
        : {
            label: "Reliable Payer",
            dot: "bg-[#3d8a68]",
            text: "text-[#478266]",
            score: "text-[#478266]",
          };

  const initials = customer.name
    ?.split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-[22px] border border-[#ddd8d3] bg-white p-5 text-left shadow-[0_8px_25px_rgba(91,68,55,0.07)] transition hover:-translate-y-0.5 hover:border-[#cdb9bd] hover:shadow-[0_12px_30px_rgba(91,68,55,0.12)] dark:border-[#423238] dark:bg-[#2b2226]"
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#eee9e8] text-sm font-semibold text-[#75434b] dark:bg-[#423238]">
            {initials || "CU"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-[#40393b] dark:text-white">
              {customer.name}
            </h3>

            <div className="mt-1 flex items-center gap-1 text-xs text-[#756d70]">
              <Phone size={12} />
              <span>{customer.phone || "No phone"}</span>
            </div>
          </div>
        </div>

        <span className={`text-sm font-semibold ${personality.score}`}>
          {score}/100
        </span>
      </div>

      {/* Details */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs text-[#756d70]">Outstanding</p>

          <p className="mt-1 text-[21px] font-semibold text-[#40393b] dark:text-white">
            ₹{outstanding.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#756d70]">Last payment</p>

          <p className="mt-1 text-sm font-medium text-[#5f5759] dark:text-[#cfc4c7]">
            {customer.lastPayment || "No payment"}
          </p>
        </div>
      </div>

      {/* Bottom Badge */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f8f7f6] px-3 py-2.5 dark:bg-[#342a2e]">
        <div className={`flex items-center gap-2 text-xs ${personality.text}`}>
          <span className={`size-2 rounded-full ${personality.dot}`} />
          {personality.label}
        </div>

        <span className="text-xs text-[#756d70]">
          {score}% to pay
        </span>
      </div>
    </button>
  );
}