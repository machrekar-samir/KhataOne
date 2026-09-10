import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Sparkles,
  Mic,
  ScanLine,
  Search,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { useApp } from "../context/useApp.js";
import { money } from "../utils/calculations.js";
import { dateKey } from "../utils/dateHelpers.js";

export default function Transactions() {
  const { data, saveTxn, deleteTxn, notify } = useApp();

  const [query, setQuery] = useState("");
  const [naturalText, setNaturalText] = useState("");
  const [form, setForm] = useState(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const getCustomerName = useCallback(
    (id) => data.customers.find((item) => item.id === id)?.name || "Unknown",
    [data.customers],
  );

  const openAdd = () => {
    if (!data.customers.length) {
      notify("Please add a customer first.");
      return;
    }

    setForm({
      customerId: data.customers[0].id,
      type: "credit",
      amount: "",
      date: dateKey(),
      dueDate: "",
      method: "UPI",
      notes: "",
    });
  };

  const filteredItems = useMemo(() => {
    return [...data.transactions]
      .filter((item) => {
        const text = `${getCustomerName(item.customerId)} ${item.method} ${item.notes || ""}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.transactions, getCustomerName, query]);

  const getStatus = (item) => {
    if (item.type === "payment") return "settled";

    if (
      item.dueDate &&
      new Date(item.dueDate) < new Date(new Date().toDateString())
    ) {
      return "overdue";
    }

    return "pending";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const examples = [
    "Ramesh ko 500 diye",
    "Anita se 2000 received cash",
    "आज रमेशला 500 रुपये उधार दिले",
    "Gave Farhan 1500 credit today",
  ];

  const handleNaturalLanguage = () => {
    if (!naturalText.trim()) {
      notify("Please type a transaction first.");
      return;
    }

    if (!data.customers.length) {
      notify("Please add a customer first.");
      return;
    }

    const text = naturalText.toLowerCase();

    const matchedCustomer = data.customers.find((customer) =>
      text.includes(customer.name.toLowerCase()),
    );

    const amountMatch = naturalText.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);

    const amount = amountMatch
      ? Number(amountMatch[1].replace(/,/g, ""))
      : "";

    const paymentWords = [
      "received",
      "receive",
      "paid me",
      "payment",
      "liya",
      "liye",
      "मिले",
      "मिला",
    ];

    const isPayment = paymentWords.some((word) => text.includes(word));

    setForm({
      customerId: matchedCustomer?.id || data.customers[0].id,
      type: isPayment ? "payment" : "credit",
      amount,
      date: dateKey(),
      dueDate: "",
      method: text.includes("cash")
        ? "Cash"
        : text.includes("bank")
          ? "Bank Transfer"
          : "UPI",
      notes: naturalText,
    });

    setNaturalText("");
  };

  const saveTransaction = (event) => {
    event.preventDefault();

    if (!form.customerId || !form.amount || Number(form.amount) <= 0) {
      notify("Please select a customer and enter a valid amount.");
      return;
    }

    saveTxn({
      ...form,
      amount: Number(form.amount),
    });

    setForm(null);
  };

  const closeVoice = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceOpen(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      setNaturalText(event.results[0][0].transcript);
      setIsListening(false);
      closeVoice();
    };
    recognition.onerror = () => {
      setIsListening(false);
      notify("We could not hear that. Please try again.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const handleDelete = () => {
    deleteTxn(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
      {/* PAGE HEADER */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#302b2b] dark:text-[#f5eeee]">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-[#71696a] dark:text-[#aaa0a2]">
            Give money, receive money, or let KhataOne read it for you.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#741f2c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f1722] active:scale-[0.98]"
        >
          <Plus size={17} />
          Add transaction
        </button>
      </div>

      {/* NATURAL LANGUAGE TABS */}
      <div className="mb-7 inline-flex max-w-full overflow-x-auto rounded-xl bg-[#eee9e2] p-1 dark:bg-[#2d2528]">
        <button className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#40393a] shadow-sm dark:bg-[#3a3033] dark:text-white">
          <Sparkles size={16} />
          Natural language
        </button>

        <button
          onClick={() => setVoiceOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm text-[#71696a] transition hover:bg-white/60 dark:text-[#aaa0a2]"
        >
          <Mic size={16} />
          Voice khata
        </button>

        <button
          onClick={() => setScannerOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm text-[#71696a] transition hover:bg-white/60 dark:text-[#aaa0a2]"
        >
          <ScanLine size={16} />
          Bill scanner
        </button>
      </div>

      {/* NATURAL LANGUAGE CARD */}
      <section className="mb-7 rounded-[22px] border border-[#ddd6ce] bg-white p-5 shadow-[0_8px_30px_rgba(73,45,30,0.04)] dark:border-[#493a3e] dark:bg-[#30272a] sm:p-6">
        <h2 className="text-lg font-bold text-[#302b2b] dark:text-white">
          Type it the way you speak
        </h2>

        <p className="mt-1 text-sm text-[#756d6d] dark:text-[#aaa0a2]">
          English, Hindi, Hinglish or Marathi — KhataOne fills in the rest.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => setNaturalText(example)}
              className="rounded-full border border-[#ded7cf] bg-[#faf8f5] px-3 py-1.5 text-xs text-[#514a4a] transition hover:border-[#8f2039] hover:text-[#8f2039] dark:border-[#514145] dark:bg-[#382f32] dark:text-[#d9d0d0]"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9090]"
            />

            <input
              value={naturalText}
              onChange={(event) => setNaturalText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleNaturalLanguage();
              }}
              placeholder="Ramesh ko 500 diye"
              className="w-full rounded-xl border border-[#dcd5cd] bg-[#faf9f7] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10 dark:border-[#4c3d41] dark:bg-[#282124] dark:text-white"
            />
          </div>

          <button
            onClick={handleNaturalLanguage}
            className="rounded-xl bg-[#9b7379] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#8f6269]"
          >
            Understand
          </button>
        </div>
      </section>

      {/* TRANSACTION LIST */}
      <section className="overflow-hidden rounded-[22px] border border-[#ddd6ce] bg-white shadow-[0_8px_30px_rgba(73,45,30,0.04)] dark:border-[#493a3e] dark:bg-[#30272a]">
        <div className="flex flex-col gap-4 border-b border-[#e5ded7] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#493a3e]">
          <div>
            <h2 className="text-lg font-bold text-[#302b2b] dark:text-white">
              All transactions
            </h2>
            <p className="mt-0.5 text-xs text-[#827879]">
              {filteredItems.length} entries
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#938989]"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transactions"
              className="w-full rounded-lg border border-[#ded7cf] bg-[#faf9f7] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#8f2039] dark:border-[#4c3d41] dark:bg-[#282124] dark:text-white"
            />
          </div>
        </div>

        {filteredItems.length ? (
          <div>
            {filteredItems.map((item) => {
              const status = getStatus(item);
              const isPayment = item.type === "payment";

              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-4 border-b border-[#e7e1db] px-5 py-4 transition hover:bg-[#faf8f5] last:border-0 dark:border-[#493a3e] dark:hover:bg-[#372d30] sm:flex-row sm:items-center"
                >
                  {/* CUSTOMER */}
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span
                      className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                        isPayment ? "bg-[#468264]" : "bg-[#7b2330]"
                      }`}
                    />

                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[#373131] dark:text-[#f2ebeb]">
                        {getCustomerName(item.customerId)}
                      </strong>

                      <p className="mt-1 truncate text-xs text-[#827879] dark:text-[#aaa0a2]">
                        {formatDate(item.date)} · {item.method}
                        {item.notes ? ` · ${item.notes}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex items-center gap-4 sm:ml-auto">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "settled"
                          ? "border border-[#ddd8d1] bg-[#faf9f7] text-[#5d5555] dark:border-[#54464a] dark:bg-[#372e31] dark:text-[#ddd4d4]"
                          : status === "overdue"
                            ? "bg-[#c8232c] text-white"
                            : "bg-[#f3eee6] text-[#7b5b42] dark:bg-[#4a3a30] dark:text-[#e2c4a3]"
                      }`}
                    >
                      {status}
                    </span>

                    <strong
                      className={`min-w-[105px] text-right text-sm font-bold ${
                        isPayment
                          ? "text-[#468264]"
                          : "text-[#5b3a3d] dark:text-[#e7d7d8]"
                      }`}
                    >
                      {isPayment ? "+" : "-"}
                      {money(item.amount, data.business.currency)}
                    </strong>

                    {/* ACTIONS */}
                    <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        onClick={() => setForm({ ...item })}
                        title="Edit"
                        className="rounded-lg p-2 text-[#756b6c] hover:bg-[#f0e8e8] hover:text-[#8f2039] dark:hover:bg-[#4a393e]"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => setDeleteId(item.id)}
                        title="Delete"
                        className="rounded-lg p-2 text-[#756b6c] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-[#f4eeeb] p-4 text-[#8f2039] dark:bg-[#3b2e32]">
              <Search size={24} />
            </div>

            <h3 className="mt-4 font-semibold dark:text-white">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-[#8b8182]">
              Add a transaction to start tracking your money.
            </p>

            <button
              onClick={openAdd}
              className="mt-4 rounded-lg bg-[#741f2c] px-4 py-2 text-sm font-semibold text-white"
            >
              Add transaction
            </button>
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveTransaction}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-white p-6 shadow-2xl dark:bg-[#30272a] sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#302b2b] dark:text-white">
                  {form.id ? "Edit transaction" : "Add transaction"}
                </h2>
                <p className="mt-1 text-sm text-[#817778]">
                  Record money given or payment received.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Customer">
                <select
                  value={form.customerId}
                  onChange={(event) =>
                    setForm({ ...form, customerId: event.target.value })
                  }
                >
                  {data.customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Transaction type">
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                >
                  <option value="credit">Money given / Credit</option>
                  <option value="payment">Payment received</option>
                </select>
              </Field>

              <Field label="Amount">
                <input
                  required
                  min="1"
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  placeholder="Enter amount"
                />
              </Field>

              <Field label="Date">
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                />
              </Field>

              <Field label="Payment method">
                <select
                  value={form.method}
                  onChange={(event) =>
                    setForm({ ...form, method: event.target.value })
                  }
                >
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Cheque</option>
                </select>
              </Field>

              <Field label="Due date (optional)">
                <input
                  type="date"
                  value={form.dueDate || ""}
                  onChange={(event) =>
                    setForm({ ...form, dueDate: event.target.value })
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Notes">
                  <textarea
                    rows="3"
                    value={form.notes || ""}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                    placeholder="Add transaction details..."
                  />
                </Field>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-xl border border-[#ddd5cd] px-5 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#741f2c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5f1722]"
              >
                {form.id ? "Save changes" : "Save transaction"}
              </button>
            </div>
          </form>
        </div>
      )}

      {voiceOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={closeVoice}
        >
          <div
            className="w-full max-w-md rounded-[22px] border border-[#ddd6ce] bg-white p-6 text-center shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a] sm:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={closeVoice}
                aria-label="Close voice transaction entry"
                className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f4e8e8] text-[#8f2039] dark:bg-[#493238] dark:text-[#e7bfc5]"><Mic size={28} /></div>
            <h2 className="mt-5 text-xl font-bold text-[#302b2b] dark:text-white">Voice transaction entry</h2>
            <p className="mt-2 text-sm leading-6 text-[#756d6d] dark:text-[#aaa0a2]">Speak your transaction naturally and KhataOne will understand it.</p>
            <button
              type="button"
              onClick={startListening}
              aria-label={isListening ? "Listening" : "Start listening"}
              className={`mx-auto mt-7 grid size-24 place-items-center rounded-full text-white shadow-lg transition hover:scale-105 ${isListening ? "animate-pulse bg-[#468264]" : "bg-[#741f2c] hover:bg-[#5f1722]"}`}
            ><Mic size={38} /></button>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#8f2039] dark:text-[#e7bfc5]">{isListening ? "Listening..." : "Tap to speak"}</p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={closeVoice} className="rounded-xl border border-[#ddd5cd] px-5 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]">Cancel</button>
              <button type="button" onClick={startListening} className="rounded-xl bg-[#741f2c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5f1722]">Start listening</button>
            </div>
          </div>
        </div>
      )}

      {scannerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setScannerOpen(false)}
        >
          <div className="w-full max-w-md rounded-[22px] border border-[#ddd6ce] bg-white p-6 shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a] sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div><h2 className="text-xl font-bold text-[#302b2b] dark:text-white">Bill scanner</h2><p className="mt-1 text-sm text-[#756d6d] dark:text-[#aaa0a2]">Upload a bill image to prepare it for transaction entry.</p></div>
              <button type="button" onClick={() => setScannerOpen(false)} aria-label="Close bill scanner" className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"><X size={20} /></button>
            </div>
            <label className="mt-6 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#d8cec8] px-5 py-8 text-center transition hover:border-[#8f2039] dark:border-[#514145]">
              <ScanLine size={30} className="text-[#8f2039]" /><span className="mt-3 text-sm font-semibold text-[#40393a] dark:text-white">Choose a bill image</span><span className="mt-1 text-xs text-[#827879]">PNG, JPG, or PDF</span>
              <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => { if (event.target.files?.[0]) { notify("Bill selected. Review the details before saving."); setScannerOpen(false); } }} />
            </label>
            <button type="button" onClick={() => setScannerOpen(false)} className="mt-5 w-full rounded-xl border border-[#ddd5cd] px-5 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]">Cancel</button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-[22px] border border-[#ddd6ce] bg-white p-6 shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a]" onMouseDown={(event) => event.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#302b2b] dark:text-white">Delete transaction?</h2>
            <p className="mt-2 text-sm leading-6 text-[#756d6d] dark:text-[#aaa0a2]">This transaction will be removed from your khata permanently.</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteId(null)} className="rounded-xl border border-[#ddd5cd] px-4 py-2.5 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]">Cancel</button><button type="button" onClick={handleDelete} className="rounded-xl bg-[#b4232d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#941c25]">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#706667] dark:text-[#aaa0a2]">
        {label}
      </span>

      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[#ddd5cd] [&_input]:bg-[#faf9f7] [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_input]:focus:border-[#8f2039] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#ddd5cd] [&_select]:bg-[#faf9f7] [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:outline-none [&_select]:focus:border-[#8f2039] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[#ddd5cd] [&_textarea]:bg-[#faf9f7] [&_textarea]:px-3.5 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea]:focus:border-[#8f2039] dark:[&_input]:border-[#514145] dark:[&_input]:bg-[#282124] dark:[&_input]:text-white dark:[&_select]:border-[#514145] dark:[&_select]:bg-[#282124] dark:[&_select]:text-white dark:[&_textarea]:border-[#514145] dark:[&_textarea]:bg-[#282124] dark:[&_textarea]:text-white">
        {children}
      </div>
    </label>
  );
}