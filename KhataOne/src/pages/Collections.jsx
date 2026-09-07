import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { money } from "../utils/calculations.js";
import {
  Send,
  ArrowRight,
  MessageCircle,
  Smartphone,
  Mail,
  Link,
  ExternalLink,
} from "lucide-react";

export default function Collections() {
  const { customers, reminder } = useApp();
  const [selected, setSelected] = useState(null);
  const [tone, setTone] = useState("Friendly");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const items = useMemo(
    () =>
      customers
        .filter((item) => Number(item.outstanding) > 0)
        .sort((a, b) => Number(b.outstanding) - Number(a.outstanding)),
    [customers],
  );

  const activeCustomer = selected || items[0];

  const totalPending = items.reduce(
    (sum, item) => sum + Number(item.outstanding || 0),
    0,
  );

  const getPriority = (customer, index) => {
    const overdue = customer?.overdue?.length || 0;

    if (overdue || index < 2)
      return {
        label: "Critical (30+ days)",
        color: "bg-[#c43d46]",
      };

    if (index < 4)
      return {
        label: "High priority (15–30 days)",
        color: "bg-[#d99a2b]",
      };

    if (index === items.length - 1)
      return {
        label: "Recently added",
        color: "bg-[#438b6b]",
      };

    return {
      label: "Due soon",
      color: "bg-[#43809b]",
    };
  };

  const trustScore = (customer, index) => {
    if (customer?.trustScore) return customer.trustScore;
    return [4, 34, 83, 71, 99, 100][index] || 75;
  };

  const createMessage = (customer = activeCustomer) => {
    if (!customer) return "";

    const amount = money(customer.outstanding);

    const messages = {
      Friendly: `Hi ${customer.name} 😊 Just a friendly reminder that ${amount} is pending. Whenever convenient!`,
      Professional: `Hello ${customer.name}, this is a reminder regarding your pending payment of ${amount}. Please arrange payment at your earliest convenience.`,
      Urgent: `Hi ${customer.name}, your payment of ${amount} is overdue. Please complete the payment as soon as possible.`,
    };

    return messages[tone];
  };

  const handleTone = (value) => {
    setTone(value);

    if (activeCustomer) {
      const amount = money(activeCustomer.outstanding);

      const messages = {
        Friendly: `Hi ${activeCustomer.name} 😊 Just a friendly reminder that ${amount} is pending. Whenever convenient!`,
        Professional: `Hello ${activeCustomer.name}, this is a reminder regarding your pending payment of ${amount}. Please arrange payment at your earliest convenience.`,
        Urgent: `Hi ${activeCustomer.name}, your payment of ${amount} is overdue. Please complete the payment as soon as possible.`,
      };

      setMessage(messages[value]);
    }
  };

  const sendReminder = (customer = activeCustomer, method = "Reminder") => {
    if (!customer) return;

    reminder(customer);

    setNotice(`${method} reminder prepared for ${customer.name}`);

    setTimeout(() => setNotice(""), 2500);
  };

  const selectCustomer = (customer) => {
    setSelected(customer);

    const amount = money(customer.outstanding);

    setMessage(
      `Hi ${customer.name} 😊 Just a friendly reminder that ${amount} is pending. Whenever convenient!`,
    );
  };

  const disputes = [
    {
      name: "Vikram Desai",
      amount: "₹2,500",
      text: "“I already paid this amount by UPI.”",
      evidence: "2 evidence files",
      date: "02 Sep 2026",
      status: "Under Review",
    },
    {
      name: "Anita Sharma",
      amount: "₹1,200",
      text: "“Goods were returned the same day.”",
      evidence: "1 evidence files",
      date: "31 Aug 2026",
      status: "Pending",
    },
    {
      name: "Ramesh Kumar",
      amount: "₹800",
      text: "“Duplicate entry for the same bill.”",
      evidence: "3 evidence files",
      date: "20 Aug 2026",
      status: "Resolved",
    },
    {
      name: "Suresh Patil",
      amount: "₹4,000",
      text: "“Amount does not match the invoice.”",
      evidence: "1 evidence files",
      date: "12 Aug 2026",
      status: "Rejected",
    },
  ];

  const statusStyle = {
    "Under Review":
      "bg-[#f4f0e8] text-[#735e43] border border-[#eee6d8]",
    Pending: "bg-[#f4f0e8] text-[#80623d] border border-[#eee6d8]",
    Resolved: "bg-white text-[#3f6856] border border-[#d9dfdb]",
    Rejected: "bg-[#c93438] text-white border border-[#c93438]",
  };

  return (
    <div className="min-h-full bg-[#f6f2ea] px-4 py-7 sm:px-7 lg:px-8">
      {/* HEADER */}
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[30px] font-semibold tracking-[-0.6px] text-[#302d2c]">
              Collections
            </h1>

            <p className="mt-1 text-sm text-[#746d68]">
              Contact these customers first — ordered by how much is at risk.
            </p>
          </div>

          <button
            onClick={() => {
              items.forEach((customer) => reminder(customer));
              setNotice(`Smart reminders sent to ${items.length} customers`);
              setTimeout(() => setNotice(""), 2500);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#76202b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#651923] active:scale-[0.98]"
          >
            <Send size={16} />
            Send all smart reminders
          </button>
        </div>

        {notice && (
          <div className="mb-5 rounded-xl border border-[#cfe0d6] bg-[#edf7f0] px-4 py-3 text-sm font-medium text-[#347052]">
            {notice}
          </div>
        )}

        {/* TOP GRID */}
        <div className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
          {/* RECOVERY QUEUE */}
          <section className="overflow-hidden rounded-[22px] border border-[#ddd5ca] bg-[#fbfaf7] shadow-[0_8px_25px_rgba(91,67,45,0.06)]">
            <div className="border-b border-[#ddd5ca] px-6 py-5">
              <h2 className="text-lg font-semibold text-[#383331]">
                Recovery queue
              </h2>

              <p className="mt-1 text-sm text-[#746d68]">
                {money(totalPending)} to recover
              </p>
            </div>

            <div>
              {items.map((customer, index) => {
                const priority = getPriority(customer, index);

                return (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className={`group flex w-full items-center gap-3 border-b border-[#ddd5ca] px-6 py-4 text-left transition last:border-0 hover:bg-[#f5f0e8] ${
                      activeCustomer?.id === customer.id
                        ? "bg-[#f5efe6]"
                        : ""
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${priority.color}`}
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold text-[#3a3532]">
                        {customer.name}
                      </h3>

                      <p className="mt-0.5 text-xs text-[#746d68]">
                        {priority.label} · trust {trustScore(customer, index)}/100
                      </p>
                    </div>

                    <strong className="whitespace-nowrap text-[15px] text-[#383331]">
                      {money(customer.outstanding)}
                    </strong>

                    <ArrowRight
                      size={19}
                      className="ml-1 text-[#766f69] transition group-hover:translate-x-1"
                    />
                  </button>
                );
              })}

              {!items.length && (
                <div className="px-6 py-16 text-center text-sm text-[#8b837b]">
                  Great! You have no pending payments.
                </div>
              )}
            </div>
          </section>

          {/* SMART REMINDER */}
          <section className="rounded-[22px] border border-[#ddd5ca] bg-[#fbfaf7] p-5 shadow-[0_8px_25px_rgba(91,67,45,0.06)]">
            <h2 className="text-lg font-semibold text-[#383331]">
              Smart reminder
            </h2>

            <p className="mt-1 text-sm text-[#746d68]">
              For {activeCustomer?.name || "Customer"} ·{" "}
              {activeCustomer ? money(activeCustomer.outstanding) : "₹0"} pending
            </p>

            {/* AI INFO */}
            <div className="mt-4 rounded-[20px] bg-[#f4f1eb] p-4">
              <p className="text-sm leading-5 text-[#423c38]">
                {activeCustomer?.name || "Customer"} usually pays during
                <br />
                month-end. Sending a reminder
                <br />
                on{" "}
                <strong>
                  28 September at 7:00 PM
                </strong>
                <br />
                may increase payment probability.
              </p>
            </div>

            {/* TONES */}
            <div className="mt-4 flex rounded-xl bg-[#f3efe9] p-1">
              {["Friendly", "Professional", "Urgent"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleTone(item)}
                  className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition ${
                    tone === item
                      ? "bg-white text-[#393431] shadow-sm"
                      : "text-[#756e68] hover:text-[#3b3633]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* MESSAGE */}
            <textarea
              value={message || createMessage()}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-3 h-[112px] w-full resize-none rounded-2xl border border-[#d9d1c6] bg-white px-4 py-3 text-sm leading-5 text-[#403a36] outline-none transition focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10"
            />

            {/* ACTION BUTTONS */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => sendReminder(activeCustomer, "WhatsApp")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] transition hover:bg-[#f8f5ef]"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>

              <button
                onClick={() => sendReminder(activeCustomer, "SMS")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] transition hover:bg-[#f8f5ef]"
              >
                <Smartphone size={16} />
                SMS
              </button>

              <button
                onClick={() => sendReminder(activeCustomer, "Email")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] transition hover:bg-[#f8f5ef]"
              >
                <Mail size={16} />
                Email
              </button>

              <button
                onClick={() => sendReminder(activeCustomer, "Payment link")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] transition hover:bg-[#f8f5ef]"
              >
                <Link size={16} />
                Payment link
              </button>
            </div>

            <button
              onClick={() =>
                setNotice(
                  `Customer payment portal opened for ${activeCustomer?.name}`,
                )
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f1ece4] px-4 py-3 text-sm font-semibold text-[#493e38] transition hover:bg-[#e8e0d5]"
            >
              Open customer payment portal
              <ExternalLink size={15} />
            </button>
          </section>
        </div>

        {/* DISPUTES */}
        <section className="mt-6 overflow-hidden rounded-[22px] border border-[#ddd5ca] bg-[#fbfaf7] shadow-[0_8px_25px_rgba(91,67,45,0.06)]">
          <div className="border-b border-[#ddd5ca] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#383331]">Disputes</h2>

            <p className="mt-1 text-sm text-[#746d68]">
              Raised by customers or your team
            </p>
          </div>

          {disputes.map((dispute, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 border-b border-[#ddd5ca] px-6 py-4 last:border-0 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#3b3532]">
                  {dispute.name} · {dispute.amount}
                </h3>

                <p className="mt-1 text-xs text-[#746d68]">
                  {dispute.text} · {dispute.evidence} · raised {dispute.date}
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyle[dispute.status]
                  }`}
                >
                  {dispute.status}
                </span>

                <button
                  onClick={() =>
                    setNotice(`Opening dispute review for ${dispute.name}`)
                  }
                  className="text-sm font-medium text-[#4b403a] hover:text-[#8f2039]"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}