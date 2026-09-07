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

  const items = useMemo(() => {
    return [...customers]
      .filter((item) => Number(item.outstanding || 0) > 0)
      .sort(
        (a, b) =>
          Number(b.outstanding || 0) - Number(a.outstanding || 0),
      );
  }, [customers]);

  const activeCustomer = selected || items[0];

  const totalPending = items.reduce(
    (sum, item) => sum + Number(item.outstanding || 0),
    0,
  );

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  };

  const getPriority = (customer, index) => {
    const overdue = Array.isArray(customer?.overdue)
      ? customer.overdue.length
      : 0;

    if (overdue || index < 2) {
      return {
        label: "Critical (30+ days)",
        color: "bg-[#c13e46]",
      };
    }

    if (index < 4) {
      return {
        label: "High priority (15–30 days)",
        color: "bg-[#d99b30]",
      };
    }

    if (index === items.length - 1) {
      return {
        label: "Recently added",
        color: "bg-[#43876a]",
      };
    }

    return {
      label: "Due soon",
      color: "bg-[#467d9b]",
    };
  };

  const getTrustScore = (customer, index) => {
    if (customer?.trustScore) return customer.trustScore;

    const scores = [4, 34, 83, 71, 99, 100];

    return scores[index] || 75;
  };

  const getCustomerPhone = (customer) => {
    let phone =
      customer?.phone ||
      customer?.mobile ||
      customer?.phoneNumber ||
      customer?.contact ||
      "";

    phone = String(phone).replace(/\D/g, "");

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    return phone;
  };

  const getMessageByTone = (customer, selectedTone) => {
    if (!customer) return "";

    const amount = money(customer.outstanding);

    const messages = {
      Friendly: `Hi ${customer.name} 😊 Just a friendly reminder that ${amount} is pending. Whenever convenient!`,

      Professional: `Hello ${customer.name}, this is a reminder regarding your pending payment of ${amount}. Please arrange the payment at your earliest convenience.`,

      Urgent: `Hi ${customer.name}, your pending payment of ${amount} requires immediate attention. Please complete the payment as soon as possible.`,
    };

    return messages[selectedTone];
  };

  const currentMessage =
    message || getMessageByTone(activeCustomer, tone);

  const selectCustomer = (customer) => {
    setSelected(customer);
    setTone("Friendly");
    setMessage(getMessageByTone(customer, "Friendly"));
  };

  const changeTone = (newTone) => {
    setTone(newTone);
    setMessage(getMessageByTone(activeCustomer, newTone));
  };

  // WHATSAPP
  const openWhatsApp = () => {
    if (!activeCustomer) return;

    const phone = getCustomerPhone(activeCustomer);
    const text = encodeURIComponent(currentMessage);

    reminder(activeCustomer);

    const url = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;

    window.open(url, "_blank", "noopener,noreferrer");

    showNotice(`WhatsApp reminder opened for ${activeCustomer.name}`);
  };

  // SMS
  const openSMS = () => {
    if (!activeCustomer) return;

    const phone = getCustomerPhone(activeCustomer);
    const text = encodeURIComponent(currentMessage);

    reminder(activeCustomer);

    window.location.href = `sms:${phone}?body=${text}`;

    showNotice(`SMS opened for ${activeCustomer.name}`);
  };

  // EMAIL
  const openEmail = () => {
    if (!activeCustomer) return;

    const email =
      activeCustomer.email ||
      activeCustomer.emailAddress ||
      "";

    const subject = encodeURIComponent(
      "Payment Reminder - KhataOne",
    );

    const body = encodeURIComponent(currentMessage);

    reminder(activeCustomer);

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    showNotice(`Email opened for ${activeCustomer.name}`);
  };

  // PAYMENT LINK
  const openPaymentLink = () => {
    if (!activeCustomer) return;

    reminder(activeCustomer);

    const paymentUrl =
      activeCustomer.paymentLink ||
      activeCustomer.paymentUrl ||
      `${window.location.origin}/payment/${activeCustomer.id}`;

    window.open(
      paymentUrl,
      "_blank",
      "noopener,noreferrer",
    );

    showNotice(
      `Payment link opened for ${activeCustomer.name}`,
    );
  };

  // CUSTOMER PAYMENT PORTAL
  const openCustomerPortal = () => {
    if (!activeCustomer) return;

    const portalUrl =
      activeCustomer.portalUrl ||
      `${window.location.origin}/customer/${activeCustomer.id}`;

    window.open(
      portalUrl,
      "_blank",
      "noopener,noreferrer",
    );

    showNotice(
      `Customer payment portal opened for ${activeCustomer.name}`,
    );
  };

  // SEND ALL REMINDERS
  const sendAllReminders = () => {
    if (!items.length) {
      showNotice("No pending customers found");
      return;
    }

    items.forEach((customer) => {
      reminder(customer);
    });

    showNotice(
      `Smart reminders sent to ${items.length} customers`,
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
      "border border-[#e7ded0] bg-[#f5f1e9] text-[#725d42]",

    Pending:
      "border border-[#e7ded0] bg-[#f5f1e9] text-[#80613e]",

    Resolved:
      "border border-[#d9dfdb] bg-white text-[#426c59]",

    Rejected:
      "border border-[#c93438] bg-[#c93438] text-white",
  };

  return (
    <div className="min-h-full bg-[#f7f3eb] px-4 py-7 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[1250px]">

        {/* PAGE HEADER */}
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
            onClick={sendAllReminders}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#76202b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#641923] active:scale-[0.98]"
          >
            <Send size={16} />
            Send all smart reminders
          </button>
        </div>

        {/* NOTICE */}
        {notice && (
          <div className="mb-5 rounded-xl border border-[#cde1d4] bg-[#edf7f0] px-4 py-3 text-sm font-medium text-[#347052]">
            {notice}
          </div>
        )}

        {/* TOP SECTION */}
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
                    className={`group flex w-full items-center gap-3 border-b border-[#ddd5ca] px-6 py-4 text-left transition last:border-b-0 hover:bg-[#f5f0e8] ${
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
                        {priority.label} · trust{" "}
                        {getTrustScore(customer, index)}/100
                      </p>
                    </div>

                    <strong className="whitespace-nowrap text-[15px] text-[#383331]">
                      {money(customer.outstanding)}
                    </strong>

                    <ArrowRight
                      size={19}
                      className="ml-1 shrink-0 text-[#766f69] transition group-hover:translate-x-1"
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
              {activeCustomer
                ? money(activeCustomer.outstanding)
                : "₹0"}{" "}
              pending
            </p>

            {/* SMART MESSAGE */}
            <div className="mt-4 rounded-[20px] bg-[#f4f1eb] p-4">
              <p className="text-sm leading-5 text-[#423c38]">
                {activeCustomer?.name || "Customer"} usually pays during
                month-end. Sending a reminder on{" "}
                <strong>28 September at 7:00 PM</strong> may increase
                payment probability.
              </p>
            </div>

            {/* TONE SELECTOR */}
            <div className="mt-4 flex rounded-xl bg-[#eeeae4] p-1">
              {["Friendly", "Professional", "Urgent"].map((item) => (
                <button
                  key={item}
                  onClick={() => changeTone(item)}
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

            {/* MESSAGE BOX */}
            <textarea
              value={currentMessage}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-3 h-[112px] w-full resize-none rounded-2xl border border-[#d9d1c6] bg-white px-4 py-3 text-sm leading-5 text-[#403a36] outline-none transition focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10"
            />

            {/* ACTION BUTTONS */}
            <div className="mt-4 grid grid-cols-2 gap-2">

              <button
                onClick={openWhatsApp}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-[#f6eee2] px-3 py-2.5 text-sm font-medium text-[#443d38] shadow-sm transition hover:bg-[#eee2d1] active:scale-[0.98]"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>

              <button
                onClick={openSMS}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] shadow-sm transition hover:bg-[#f8f5ef] active:scale-[0.98]"
              >
                <Smartphone size={16} />
                SMS
              </button>

              <button
                onClick={openEmail}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] shadow-sm transition hover:bg-[#f8f5ef] active:scale-[0.98]"
              >
                <Mail size={16} />
                Email
              </button>

              <button
                onClick={openPaymentLink}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-sm font-medium text-[#443d38] shadow-sm transition hover:bg-[#f8f5ef] active:scale-[0.98]"
              >
                <Link size={16} />
                Payment link
              </button>
            </div>

            {/* CUSTOMER PORTAL */}
            <button
              onClick={openCustomerPortal}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0ebe3] px-4 py-3 text-sm font-semibold text-[#493e38] shadow-sm transition hover:bg-[#e7ded2] active:scale-[0.98]"
            >
              Open customer payment portal
              <ExternalLink size={15} />
            </button>
          </section>
        </div>

        {/* DISPUTES */}
        <section className="mt-6 overflow-hidden rounded-[22px] border border-[#ddd5ca] bg-[#fbfaf7] shadow-[0_8px_25px_rgba(91,67,45,0.06)]">

          <div className="border-b border-[#ddd5ca] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#383331]">
              Disputes
            </h2>

            <p className="mt-1 text-sm text-[#746d68]">
              Raised by customers or your team
            </p>
          </div>

          {disputes.map((dispute, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 border-b border-[#ddd5ca] px-6 py-4 last:border-b-0 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#3b3532]">
                  {dispute.name} · {dispute.amount}
                </h3>

                <p className="mt-1 text-xs text-[#746d68]">
                  {dispute.text} · {dispute.evidence} · raised{" "}
                  {dispute.date}
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
                    showNotice(
                      `Opening dispute review for ${dispute.name}`,
                    )
                  }
                  className="text-sm font-medium text-[#4b403a] transition hover:text-[#8f2039]"
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