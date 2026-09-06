import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Heading } from "../components/PageParts.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { money } from "../utils/calculations.js";
import { dateKey } from "../utils/dateHelpers.js";
export default function Transactions() {
  const { data, saveTxn, deleteTxn } = useApp();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const name = (id) =>
    data.customers.find((item) => item.id === id)?.name || "Unknown";
  const items = data.transactions.filter((item) =>
    name(item.customerId).toLowerCase().includes(query.toLowerCase()),
  );
  const field =
    "w-full rounded-lg border border-[#ebe7e3] bg-white px-3 py-2.5 text-sm dark:border-[#423238] dark:bg-[#2b2226]";
  return (
    <Heading
      eyebrow="MONEY MOVEMENT"
      title="Transactions"
      action="Add transaction"
      onAction={() =>
        setForm({
          customerId: data.customers[0]?.id || "",
          type: "credit",
          amount: "",
          date: dateKey(),
          dueDate: "",
          method: "UPI",
          notes: "",
        })
      }
    >
      <div className="mb-4">
        <input
          className={field}
          placeholder="Search transactions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-[#ebe7e3] bg-white dark:border-[#423238] dark:bg-[#2b2226]">
        {items.map((item) => (
          <div
            className="flex flex-col gap-3 border-b border-[#ebe7e3] p-4 last:border-0 sm:flex-row sm:items-center dark:border-[#423238]"
            key={item.id}
          >
            <div className="flex-1">
              <strong className="block text-sm">{name(item.customerId)}</strong>
              <small className="text-xs text-[#8b8383]">
                {item.date} · {item.method} · {item.notes || "No notes"}
              </small>
            </div>
            <strong
              className={
                item.type === "payment" ? "text-[#468264]" : "text-[#bf6873]"
              }
            >
              {item.type === "payment" ? "+" : "-"}
              {money(item.amount, data.business.currency)}
            </strong>
            <div className="flex gap-3 text-xs">
              <button
                className="font-bold text-[#8f2039]"
                onClick={() => setForm(item)}
              >
                Edit
              </button>
              <button
                className="text-[#bf6873]"
                onClick={() => deleteTxn(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!items.length && <EmptyState text="Add your first transaction." />}
      </div>
      {form && (
        <form
          className="mt-4 grid gap-4 rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226]"
          onSubmit={(event) => {
            event.preventDefault();
            saveTxn({ ...form, amount: +form.amount });
            setForm(null);
          }}
        >
          <h2 className="font-serif text-xl font-bold sm:col-span-2">
            {form.id ? "Edit transaction" : "Add transaction"}
          </h2>
          <label className="space-y-1 text-xs font-bold">
            Customer
            <select
              className={field}
              value={form.customerId}
              onChange={(event) =>
                setForm({ ...form, customerId: event.target.value })
              }
            >
              {data.customers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold">
            Type
            <select
              className={field}
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              <option value="credit">Credit / money given</option>
              <option value="payment">Payment received</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-bold">
            Amount
            <input
              className={field}
              required
              type="number"
              min="1"
              value={form.amount}
              onChange={(event) =>
                setForm({ ...form, amount: event.target.value })
              }
            />
          </label>
          <div className="flex gap-3">
            <button className="rounded-lg bg-[#8f2039] px-3.5 py-2.5 text-xs font-bold text-white">
              Save transaction
            </button>
            <button
              type="button"
              className="text-xs font-bold text-[#8f2039]"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Heading>
  );
}
