import { useApp } from "../context/AppContext.jsx";
import { Heading, Stat, CustomerRow } from "../components/PageParts.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { money } from "../utils/calculations.js";
export default function Collections() {
  const { customers, reminder } = useApp();
  const items = customers.filter((item) => item.outstanding);
  return (
    <Heading eyebrow="RECOVERY WORKSPACE" title="Collections">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total pending"
          value={money(items.reduce((sum, item) => sum + item.outstanding, 0))}
          icon="◷"
        />
        <Stat
          label="Overdue customers"
          value={items.filter((item) => item.overdue.length).length}
          icon="!"
          tone="amber"
        />
        <Stat
          label="Collection rate"
          value={`${Math.round(
            (customers.reduce((sum, item) => sum + item.payments, 0) /
              Math.max(
                1,
                customers.reduce((sum, item) => sum + item.credit, 0),
              )) *
              100,
          )}%`}
          icon="✓"
          tone="green"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-[#ebe7e3] bg-white dark:border-[#423238] dark:bg-[#2b2226]">
        {items.map((customer) => (
          <div
            className="flex flex-col gap-2 border-b border-[#ebe7e3] p-2 last:border-0 sm:flex-row sm:items-center dark:border-[#423238]"
            key={customer.id}
          >
            <div className="flex-1">
              <CustomerRow customer={customer} />
            </div>
            <button
              className="px-3 pb-2 text-left text-xs font-bold text-[#8f2039] sm:pb-0"
              onClick={() => reminder(customer)}
            >
              Send reminder
            </button>
          </div>
        ))}
        {!items.length && (
          <EmptyState text="Great! You have no pending payments." />
        )}
      </div>
    </Heading>
  );
}
