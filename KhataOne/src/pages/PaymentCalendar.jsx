import { useApp } from "../context/AppContext.jsx";
import { Heading } from "../components/PageParts.jsx";
import { dateKey } from "../utils/dateHelpers.js";
export default function PaymentCalendar() {
  const { data, customers } = useApp();
  const due = data.transactions.filter((item) => item.dueDate);
  return (
    <Heading eyebrow="PAYMENT SCHEDULE" title="Payment calendar">
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
        {Array.from({ length: 35 }, (_, index) => {
          const day = new Date();
          day.setDate(index + 1);
          const entries = due.filter((item) => item.dueDate === dateKey(day));
          return (
            <div
              className={`min-h-20 rounded-lg border p-2 text-xs ${entries.length ? "border-[#8f2039] bg-[#fbecef]" : "border-[#ebe7e3] bg-white dark:border-[#423238] dark:bg-[#2b2226]"}`}
              key={index}
            >
              <strong>{day.getDate()}</strong>
              {entries.map((item) => (
                <small
                  className="mt-2 block truncate text-[#8f2039]"
                  key={item.id}
                >
                  {
                    customers.find(
                      (customer) => customer.id === item.customerId,
                    )?.name
                  }
                </small>
              ))}
            </div>
          );
        })}
      </div>
    </Heading>
  );
}
