import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link,
  Mail,
  MessageCircle,
  Send,
  Smartphone,
  Trash2,
} from "lucide-react";

import { useApp } from "../context/useApp.js";
import { money } from "../utils/calculations.js";

import {
  updateReminder,
  deleteReminder,
} from "../services/reminderService.js";

export default function Collections() {
  const {
    user,
    customers = [],
    reminders = [],
    reminder,
    notify,
  } = useApp();

  const [selected, setSelected] =
    useState(null);

  const [tone, setTone] =
    useState("Friendly");

  const [message, setMessage] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [filter, setFilter] =
    useState("Pending");

  const [busy, setBusy] =
    useState(false);

  const items = useMemo(
    () =>
      [...customers]
        .filter(
          (item) =>
            Number(
              item.outstanding || 0,
            ) > 0,
        )
        .sort(
          (a, b) =>
            Number(
              b.outstanding || 0,
            ) -
            Number(
              a.outstanding || 0,
            ),
        ),
    [customers],
  );

  const activeCustomer =
    selected || items[0] || null;

  const totalPending =
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.outstanding || 0,
        ),
      0,
    );

  const filteredReminders =
    useMemo(() => {
      if (filter === "All") {
        return reminders;
      }

      if (filter === "Completed") {
        return reminders.filter(
          (item) =>
            item.status ===
              "completed" ||
            item.status === "sent",
        );
      }

      return reminders.filter(
        (item) =>
          item.status ===
            "queued" ||
          item.status === "pending",
      );
    }, [reminders, filter]);

  const noticeMessage = (text) => {
    setNotice(text);

    window.setTimeout(
      () => setNotice(""),
      3000,
    );
  };

  const getPriority = (
    customer,
    index,
  ) => {
    const overdue =
      customer?.overdue?.length || 0;

    if (overdue > 0) {
      return {
        label: "Critical",
        color: "bg-[#c13e46]",
      };
    }

    if (index < 2) {
      return {
        label: "High priority",
        color: "bg-[#d99b30]",
      };
    }

    return {
      label: "Due soon",
      color: "bg-[#467d9b]",
    };
  };

  const getTrustScore = (
    customer,
  ) => {
    const value = Number(
      customer?.score,
    );

    return Number.isFinite(value)
      ? Math.max(
          0,
          Math.min(100, value),
        )
      : 50;
  };

  const getPhone = (customer) => {
    let phone =
      customer?.phone ||
      customer?.mobile ||
      customer?.phoneNumber ||
      "";

    phone = String(phone).replace(
      /\D/g,
      "",
    );

    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    return phone;
  };

  const messageFor = (
    customer,
    selectedTone,
  ) => {
    if (!customer) return "";

    const amount = money(
      customer.outstanding,
    );

    return {
      Friendly: `Hi ${customer.name} 😊 Just a friendly reminder that ${amount} is pending. Whenever convenient!`,

      Professional: `Hello ${customer.name}, this is a reminder regarding your pending payment of ${amount}. Please arrange the payment at your earliest convenience.`,

      Urgent: `Hi ${customer.name}, your pending payment of ${amount} requires immediate attention. Please complete the payment as soon as possible.`,
    }[selectedTone];
  };

  const currentMessage =
    message ||
    messageFor(
      activeCustomer,
      tone,
    );

  const selectCustomer = (
    customer,
  ) => {
    setSelected(customer);
    setTone("Friendly");
    setMessage(
      messageFor(
        customer,
        "Friendly",
      ),
    );
  };

  const changeTone = (value) => {
    setTone(value);
    setMessage(
      messageFor(
        activeCustomer,
        value,
      ),
    );
  };

  /* SEND CHANNEL */
  const sendChannel = async (
    channel,
  ) => {
    if (!activeCustomer) return;

    setBusy(true);

    try {
      const success =
        await reminder(
          activeCustomer,
          channel,
          currentMessage,
        );

      if (!success) return;

      const phone =
        getPhone(
          activeCustomer,
        );

      const encoded =
        encodeURIComponent(
          currentMessage,
        );

      if (channel === "WhatsApp") {
        const url = phone
          ? `https://wa.me/${phone}?text=${encoded}`
          : `https://wa.me/?text=${encoded}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer",
        );
      }

      if (channel === "SMS") {
        window.location.href =
          `sms:${phone}?body=${encoded}`;
      }

      if (channel === "Email") {
        const email =
          activeCustomer.email ||
          "";

        const subject =
          encodeURIComponent(
            "Payment Reminder - KhataOne",
          );

        window.location.href =
          `mailto:${email}?subject=${subject}&body=${encoded}`;
      }

      if (
        channel === "Payment Link"
      ) {
        const url =
          activeCustomer.paymentLink ||
          activeCustomer.paymentUrl ||
          `${window.location.origin}/payment/${activeCustomer.id}`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer",
        );
      }

      noticeMessage(
        `${channel} opened for ${activeCustomer.name}`,
      );
    } finally {
      setBusy(false);
    }
  };

  /* SEND ALL */
  const sendAll = async () => {
    if (!items.length) {
      noticeMessage(
        "No pending customers found",
      );
      return;
    }

    setBusy(true);

    try {
      const results =
        await Promise.all(
          items.map((customer) =>
            reminder(
              customer,
              "WhatsApp",
              messageFor(
                customer,
                "Friendly",
              ),
            ),
          ),
        );

      const count =
        results.filter(Boolean).length;

      noticeMessage(
        `${count} reminders queued successfully`,
      );
    } finally {
      setBusy(false);
    }
  };

  /* COMPLETE */
  const markCompleted = async (
    item,
  ) => {
    if (!user?.uid || !item?.id) {
      return;
    }

    try {
      await updateReminder(
        user.uid,
        item.id,
        {
          status: "completed",
          sentAt: new Date(),
        },
      );

      notify(
        "Reminder marked as completed",
      );
    } catch (error) {
      console.error(error);

      notify(
        "Failed to update reminder",
      );
    }
  };

  /* DELETE */
  const removeReminder = async (
    item,
  ) => {
    if (!user?.uid || !item?.id) {
      return;
    }

    try {
      await deleteReminder(
        user.uid,
        item.id,
      );

      notify(
        "Reminder deleted",
      );
    } catch (error) {
      console.error(error);

      notify(
        "Failed to delete reminder",
      );
    }
  };

  return (
    <div className="min-h-full bg-[#f7f3eb] px-4 py-6 sm:px-7 lg:px-8">
      <div className="mx-auto max-w-[1250px]">

        {/* HEADER */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#302d2c]">
              Collections
            </h1>

            <p className="mt-1 text-xs text-[#746d68] sm:text-sm">
              Recover pending payments with smart reminders.
            </p>
          </div>

          <button
            onClick={sendAll}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#76202b] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#641923] disabled:opacity-50"
          >
            <Send size={15} />
            Send all reminders
          </button>

        </header>

        {/* NOTICE */}
        {notice && (
          <div className="mb-5 rounded-xl border border-[#cde1d4] bg-[#edf7f0] px-4 py-3 text-xs font-semibold text-[#347052]">
            {notice}
          </div>
        )}

        {/* TOP */}
        <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">

          {/* QUEUE */}
          <section className="overflow-hidden rounded-[20px] border border-[#ddd5ca] bg-[#fbfaf7] shadow-sm">

            <div className="flex items-center justify-between border-b border-[#ddd5ca] px-5 py-4">

              <div>
                <h2 className="text-[17px] font-bold text-[#383331]">
                  Recovery queue
                </h2>

                <p className="mt-1 text-xs text-[#746d68]">
                  {money(totalPending)} to recover
                </p>
              </div>

              <span className="rounded-full bg-[#f5e8e9] px-3 py-1 text-[9px] font-bold text-[#8f2039]">
                {items.length} pending
              </span>

            </div>

            {items.map(
              (customer, index) => {
                const priority =
                  getPriority(
                    customer,
                    index,
                  );

                return (
                  <button
                    key={customer.id}
                    onClick={() =>
                      selectCustomer(
                        customer,
                      )
                    }
                    className={`flex w-full items-center gap-3 border-b border-[#ddd5ca] px-5 py-4 text-left transition hover:bg-[#f5f0e8] ${
                      activeCustomer?.id ===
                      customer.id
                        ? "bg-[#f5efe6]"
                        : ""
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${priority.color}`}
                    />

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate text-sm font-bold text-[#3a3532]">
                        {customer.name}
                      </h3>

                      <p className="mt-1 text-[10px] text-[#746d68]">
                        {priority.label}
                        {" · "}
                        Trust{" "}
                        {getTrustScore(
                          customer,
                        )}
                        /100
                      </p>

                    </div>

                    <strong className="text-sm text-[#383331]">
                      {money(
                        customer.outstanding,
                      )}
                    </strong>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-[#766f69]"
                    />
                  </button>
                );
              },
            )}

            {!items.length && (
              <div className="px-5 py-14 text-center text-xs text-[#8b837b]">
                Great! You have no pending payments.
              </div>
            )}

          </section>

          {/* SMART REMINDER */}
          <section className="rounded-[20px] border border-[#ddd5ca] bg-[#fbfaf7] p-5 shadow-sm">

            <h2 className="text-[17px] font-bold text-[#383331]">
              Smart reminder
            </h2>

            <p className="mt-1 text-xs text-[#746d68]">
              For{" "}
              <strong>
                {activeCustomer?.name ||
                  "Customer"}
              </strong>
              {" · "}
              {activeCustomer
                ? money(
                    activeCustomer.outstanding,
                  )
                : "₹0"}{" "}
              pending
            </p>

            {activeCustomer ? (
              <>
                {/* MESSAGE */}
                <textarea
                  value={currentMessage}
                  onChange={(e) =>
                    setMessage(
                      e.target.value,
                    )
                  }
                  className="mt-4 h-[115px] w-full resize-none rounded-2xl border border-[#d9d1c6] bg-white px-4 py-3 text-xs leading-5 text-[#403a36] outline-none focus:border-[#8f2039]"
                />

                {/* TONE */}
                <div className="mt-3 flex rounded-xl bg-[#eeeae4] p-1">

                  {[
                    "Friendly",
                    "Professional",
                    "Urgent",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        changeTone(
                          item,
                        )
                      }
                      className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-semibold ${
                        tone === item
                          ? "bg-white text-[#393431] shadow-sm"
                          : "text-[#756e68]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}

                </div>

                {/* CHANNELS */}
                <div className="mt-3 grid grid-cols-2 gap-2">

                  <ChannelButton
                    icon={MessageCircle}
                    label="WhatsApp"
                    onClick={() =>
                      sendChannel(
                        "WhatsApp",
                      )
                    }
                    disabled={busy}
                  />

                  <ChannelButton
                    icon={Smartphone}
                    label="SMS"
                    onClick={() =>
                      sendChannel(
                        "SMS",
                      )
                    }
                    disabled={busy}
                  />

                  <ChannelButton
                    icon={Mail}
                    label="Email"
                    onClick={() =>
                      sendChannel(
                        "Email",
                      )
                    }
                    disabled={busy}
                  />

                  <ChannelButton
                    icon={Link}
                    label="Payment link"
                    onClick={() =>
                      sendChannel(
                        "Payment Link",
                      )
                    }
                    disabled={busy}
                  />

                </div>

                <button
                  onClick={() => {
                    const url =
                      `${window.location.origin}/customer/${activeCustomer.id}`;

                    window.open(
                      url,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0ebe3] px-4 py-3 text-xs font-bold text-[#493e38] hover:bg-[#e7ded2]"
                >
                  Open customer payment portal
                  <ExternalLink size={14} />
                </button>

              </>
            ) : (
              <div className="mt-6 rounded-xl bg-[#f4f1eb] p-6 text-center text-xs text-[#827a75]">
                Select a customer from the recovery queue.
              </div>
            )}

          </section>
        </div>

        {/* REMINDER HISTORY */}
        <section className="mt-5 overflow-hidden rounded-[20px] border border-[#ddd5ca] bg-[#fbfaf7] shadow-sm">

          <div className="flex flex-col gap-3 border-b border-[#ddd5ca] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-[17px] font-bold text-[#383331]">
                Reminder history
              </h2>

              <p className="mt-1 text-xs text-[#746d68]">
                Live reminders from Firebase
              </p>
            </div>

            <div className="flex rounded-lg bg-[#eeeae4] p-1">

              {[
                "Pending",
                "Completed",
                "All",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-md px-3 py-1.5 text-[9px] font-bold ${
                    filter === item
                      ? "bg-white text-[#8f2039] shadow-sm"
                      : "text-[#766f69]"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          {filteredReminders.length ===
          0 ? (
            <div className="px-5 py-12 text-center text-xs text-[#8b837b]">
              No reminders found.
            </div>
          ) : (
            <div className="divide-y divide-[#e5ddd5]">

              {filteredReminders.map(
                (item) => {
                  const completed =
                    item.status ===
                      "completed" ||
                    item.status === "sent";

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                    >

                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                          completed
                            ? "bg-[#e8f5ed] text-[#37815f]"
                            : "bg-[#f8e8ea] text-[#8f2039]"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2
                            size={17}
                          />
                        ) : (
                          <Clock3
                            size={17}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <strong className="text-xs font-bold text-[#393337]">
                            {item.customerName ||
                              "Customer"}
                          </strong>

                          <span className="rounded-full bg-[#f1ece7] px-2 py-1 text-[8px] font-bold text-[#716965]">
                            {item.channel ||
                              "WhatsApp"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[8px] font-bold ${
                              completed
                                ? "bg-[#e8f5ed] text-[#37815f]"
                                : "bg-[#fff0d9] text-[#a26c17]"
                            }`}
                          >
                            {item.status ||
                              "queued"}
                          </span>

                        </div>

                        <p className="mt-1 text-[10px] text-[#827a75]">
                          {money(
                            item.amount,
                          )}

                          {item.createdAt?.toDate
                            ? ` · ${item.createdAt
                                .toDate()
                                .toLocaleString(
                                  "en-IN",
                                )}`
                            : ""}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        {!completed && (
                          <button
                            onClick={() =>
                              markCompleted(
                                item,
                              )
                            }
                            className="rounded-lg bg-[#e8f5ed] px-3 py-2 text-[9px] font-bold text-[#37815f]"
                          >
                            Mark done
                          </button>
                        )}

                        <button
                          onClick={() =>
                            removeReminder(
                              item,
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-[#a58d91] hover:bg-[#fff0f1] hover:text-[#c33448]"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>

                    </div>
                  );
                },
              )}

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

function ChannelButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 rounded-xl border border-[#d9d1c6] bg-white px-3 py-2.5 text-xs font-semibold text-[#443d38] transition hover:border-[#8f2039] hover:text-[#8f2039] disabled:opacity-50"
    >
      <Icon size={15} />
      {label}
    </button>
  );
}