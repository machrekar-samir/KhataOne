import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Heading, PanelHeading, Stat } from "../components/PageParts.jsx";
import { byId } from "../utils/helpers.js";
import { money } from "../utils/calculations.js";
export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, customers, reminder, deleteCustomer } = useApp();
  const customer = byId(customers, id);
  if (!customer) return <p>Customer not found.</p>;
  return (
    <div>
      <button
        className="mb-5 text-xs font-bold text-[#8f2039]"
        onClick={() => navigate("/customers")}
      >
        ← Back to customers
      </button>
      <Heading eyebrow="CUSTOMER PROFILE" title={customer.name}>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Outstanding"
            value={money(customer.outstanding)}
            icon="◷"
            tone="amber"
          />
          <Stat label="Total credit" value={money(customer.credit)} icon="↗" />
          <Stat
            label="Payments"
            value={money(customer.payments)}
            icon="✓"
            tone="green"
          />
          <Stat label="Trust score" value={`${customer.score}/100`} icon="✦" />
        </div>
        <div className="rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226]">
          <PanelHeading eyebrow="PAYMENT BEHAVIOUR" title={customer.status} />
          <p className="mb-4 text-sm text-[#8b8383]">
            {customer.notes || "No notes added yet."}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#8f2039]">
            <button onClick={() => reminder(customer)}>Send reminder ↗</button>
            <button
              className="text-[#bf6873]"
              onClick={() => deleteCustomer(customer.id)}
            >
              Delete customer
            </button>
          </div>
          <div className="mt-5 divide-y divide-[#ebe7e3] dark:divide-[#423238]">
            {customer.own.map((item) => (
              <div
                className="flex items-center justify-between py-3 text-sm"
                key={item.id}
              >
                <span>{item.date}</span>
                <strong>{item.type}</strong>
                <strong>{money(item.amount, data.business.currency)}</strong>
              </div>
            ))}
          </div>
        </div>
      </Heading>
    </div>
  );
}
