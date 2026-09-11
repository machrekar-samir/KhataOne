import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Plus,
  Sparkles,
  Mic,
  ScanLine,
  Search,
  X,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  Square,
} from "lucide-react";

import { useApp } from "../context/useApp.js";
import { money } from "../utils/calculations.js";
import { dateKey } from "../utils/dateHelpers.js";

export default function Transactions() {
  const {
    data,
    saveTxn,
    deleteTxn,
    notify,
    currency,
  } = useApp();

  const [query, setQuery] = useState("");
  const [naturalText, setNaturalText] = useState("");
  const [form, setForm] = useState(null);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] =
    useState("en-IN");

  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState("");
  const [scanText, setScanText] = useState("");
  const [scanning, setScanning] = useState(false);

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const customers = useMemo(
    () => data?.customers || [],
    [data?.customers],
  );
  const transactions = useMemo(
    () => data?.transactions || [],
    [data?.transactions],
  );

  const getCustomerName = useCallback(
    (id) =>
      customers.find(
        (item) => item.id === id,
      )?.name || "Unknown",
    [customers],
  );

  const openAdd = () => {
    if (!customers.length) {
      notify("Please add a customer first.");
      return;
    }

    setForm({
      customerId: customers[0].id,
      type: "credit",
      amount: "",
      date: dateKey(),
      dueDate: "",
      method: "UPI",
      notes: "",
    });
  };

  const filteredItems = useMemo(() => {
    const search = query.toLowerCase().trim();

    return [...transactions]
      .filter((item) => {
        const text =
          `${getCustomerName(item.customerId)} ${
            item.method || ""
          } ${item.notes || ""} ${
            item.type || ""
          }`.toLowerCase();

        return text.includes(search);
      })
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date),
      );
  }, [
    transactions,
    getCustomerName,
    query,
  ]);

  const getStatus = (item) => {
    if (item.type === "payment") {
      return "settled";
    }

    if (
      item.dueDate &&
      new Date(item.dueDate) <
        new Date(new Date().toDateString())
    ) {
      return "overdue";
    }

    return "pending";
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(date);
  };

  /* ================= NATURAL LANGUAGE ================= */

  const examples = [
    "Ramesh ko 500 diye",
    "Anita se 2000 received cash",
    "आज रमेशला 500 रुपये उधार दिले",
    "Gave Farhan 1500 credit today",
  ];

  const parseTransaction = (input) => {
    const original = input.trim();
    const text = original.toLowerCase();

    const customer = customers.find(
      (item) =>
        text.includes(
          String(item.name || "")
            .toLowerCase(),
        ),
    );

    const amountMatch = original.match(
      /(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d+)?)/i,
    );

    const amount = amountMatch
      ? Number(
          amountMatch[1].replace(/,/g, ""),
        )
      : "";

    const paymentWords = [
      "received",
      "receive",
      "payment",
      "paid me",
      "mila",
      "mili",
      "mili hai",
      "mila hai",
      "liya",
      "liye",
      "मिले",
      "मिला",
      "मिळाले",
      "घेतले",
      "received",
    ];

    const isPayment = paymentWords.some(
      (word) => text.includes(word),
    );

    const method = text.includes("cash")
      ? "Cash"
      : text.includes("bank")
        ? "Bank Transfer"
        : text.includes("card")
          ? "Card"
          : text.includes("cheque")
            ? "Cheque"
            : "UPI";

    return {
      customerId:
        customer?.id ||
        customers[0]?.id ||
        "",
      type: isPayment
        ? "payment"
        : "credit",
      amount,
      date: dateKey(),
      dueDate: "",
      method,
      notes: original,
    };
  };

  const handleNaturalLanguage = () => {
    if (!naturalText.trim()) {
      notify(
        "Type a transaction first.",
      );
      return;
    }

    if (!customers.length) {
      notify(
        "Please add a customer first.",
      );
      return;
    }

    const parsed =
      parseTransaction(naturalText);

    if (!parsed.amount) {
      notify(
        "I couldn't find the amount. Try: Ramesh ko 500 diye",
      );
      return;
    }

    setForm(parsed);
  };

  /* ================= SAVE ================= */

  const saveTransaction = async (event) => {
    event.preventDefault();

    if (
      !form?.customerId ||
      !form?.amount ||
      Number(form.amount) <= 0
    ) {
      notify(
        "Please select a customer and enter a valid amount.",
      );
      return;
    }

    const success = await saveTxn({
      ...form,
      amount: Number(form.amount),
    });

    if (success) {
      setForm(null);
    }
  };

  /* ================= VOICE ================= */

  const closeVoice = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setVoiceOpen(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      notify(
        "Voice input is not supported in this browser. Please use Chrome.",
      );
      return;
    }

    recognitionRef.current?.stop();

    const recognition =
      new SpeechRecognition();

    recognition.lang = voiceLanguage;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0].transcript;
      }

      setNaturalText(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition:",
        event.error,
      );

      setIsListening(false);

      if (
        event.error ===
        "not-allowed"
      ) {
        notify(
          "Microphone permission denied. Please allow microphone access.",
        );
      } else {
        notify(
          "Voice recognition failed. Please try again.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  /* ================= BILL SCANNER ================= */

  const resetScanner = () => {
    setScanFile(null);
    setScanPreview("");
    setScanText("");
    setScanning(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeScanner = () => {
    resetScanner();
    setScannerOpen(false);
  };

  const parseScanText = (text) => {
    const clean = String(text || "")
      .replace(/\s+/g, " ")
      .trim();

    const amountMatches = [
      ...clean.matchAll(
        /(?:total|grand total|amount|net total|balance|payable)[^\d₹$€]{0,20}(?:₹|rs\.?|inr|\$|€)?\s*(\d[\d,]*(?:\.\d+)?)/gi,
      ),
    ];

    let amount = "";

    if (amountMatches.length) {
      const last =
        amountMatches[
          amountMatches.length - 1
        ];

      amount = Number(
        last[1].replace(/,/g, ""),
      );
    }

    if (!amount) {
      const numbers = [
        ...clean.matchAll(
          /(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)/gi,
        ),
      ];

      if (numbers.length) {
        amount = Number(
          numbers[
            numbers.length - 1
          ][1].replace(/,/g, ""),
        );
      }
    }

    const matchedCustomer =
      customers.find((customer) =>
        clean
          .toLowerCase()
          .includes(
            String(
              customer.name || "",
            ).toLowerCase(),
          ),
      );

    const method =
      /cash/i.test(clean)
        ? "Cash"
        : /bank|transfer/i.test(clean)
          ? "Bank Transfer"
          : /card/i.test(clean)
            ? "Card"
            : /cheque|check/i.test(clean)
              ? "Cheque"
              : "UPI";

    return {
      customerId:
        matchedCustomer?.id ||
        customers[0]?.id ||
        "",
      type: /paid|received|payment/i.test(
        clean,
      )
        ? "payment"
        : "credit",
      amount,
      date: dateKey(),
      dueDate: "",
      method,
      notes: `Scanned bill: ${clean.slice(
        0,
        500,
      )}`,
    };
  };

  const scanBill = async (file) => {
    if (!file) return;

    const validImage =
      file.type.startsWith("image/");

    const validPdf =
      file.type === "application/pdf";

    if (!validImage && !validPdf) {
      notify(
        "Please select a JPG, PNG or PDF file.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify(
        "File is too large. Maximum size is 10 MB.",
      );
      return;
    }

    setScanFile(file);
    setScanText("");
    setScanning(true);

    if (validImage) {
      const preview =
        URL.createObjectURL(file);

      setScanPreview(preview);
    }

    try {
      const { createWorker } =
        await import("tesseract.js");

      const worker =
        await createWorker("eng");

      const result =
        await worker.recognize(file);

      const text =
        result?.data?.text || "";

      await worker.terminate();

      setScanText(text);

      if (!text.trim()) {
        notify(
          "No readable text found in this bill.",
        );
        setScanning(false);
        return;
      }

      const parsed =
        parseScanText(text);

      if (!parsed.amount) {
        notify(
          "Bill scanned, but total amount could not be detected. Please enter it manually.",
        );
      } else {
        notify(
          "Bill scanned successfully. Review the transaction.",
        );
      }
    } catch (error) {
      console.error(
        "Bill scanner error:",
        error,
      );

      notify(
        "Could not scan this bill. Please try a clear image.",
      );
    } finally {
      setScanning(false);
    }
  };

  const useScannedBill = () => {
    if (!scanText.trim()) {
      notify(
        "Scan a bill first.",
      );
      return;
    }

    if (!customers.length) {
      notify(
        "Please add a customer first.",
      );
      return;
    }

    const parsed =
      parseScanText(scanText);

    setForm(parsed);
    setScannerOpen(false);
    resetScanner();
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    const success =
      await deleteTxn(deleteId);

    if (success !== false) {
      setDeleteId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-[#f4e7e8] text-[#7b2335] dark:bg-[#493238]">
              <FileText size={18} />
            </div>

            <h1 className="text-[28px] font-bold tracking-tight text-[#302b2b] dark:text-[#f5eeee]">
              Transactions
            </h1>
          </div>

          <p className="mt-1 text-sm text-[#71696a] dark:text-[#aaa0a2]">
            Give money, receive money, or let KhataOne understand it for you.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#741f2c] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#5f1722] hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={17} />
          Add transaction
        </button>
      </div>

      {/* MODE TABS */}
      <div className="mb-5 flex w-fit max-w-full overflow-x-auto rounded-xl bg-[#eee9e2] p-1 dark:bg-[#2d2528]">
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#40393a] shadow-sm dark:bg-[#3a3033] dark:text-white"
        >
          <Sparkles size={16} />
          Natural language
        </button>

        <button
          type="button"
          onClick={() =>
            setVoiceOpen(true)
          }
          className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[#71696a] transition hover:bg-white/70 hover:text-[#741f2c] dark:text-[#aaa0a2]"
        >
          <Mic size={16} />
          Voice khata
        </button>

        <button
          type="button"
          onClick={() =>
            setScannerOpen(true)
          }
          className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[#71696a] transition hover:bg-white/70 hover:text-[#741f2c] dark:text-[#aaa0a2]"
        >
          <ScanLine size={16} />
          Bill scanner
        </button>
      </div>

      {/* NATURAL LANGUAGE */}
      <section className="mb-6 rounded-[20px] border border-[#ddd6ce] bg-white p-5 shadow-[0_8px_30px_rgba(73,45,30,0.04)] dark:border-[#493a3e] dark:bg-[#30272a] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f5e9ea] text-[#741f2c] dark:bg-[#493238]">
            <Sparkles size={19} />
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-[#302b2b] dark:text-white">
              Type it the way you speak
            </h2>

            <p className="mt-1 text-sm text-[#756d6d] dark:text-[#aaa0a2]">
              English, Hindi, Hinglish or Marathi — KhataOne fills in the rest.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() =>
                setNaturalText(example)
              }
              className="rounded-full border border-[#ded7cf] bg-[#faf8f5] px-3 py-1.5 text-xs text-[#514a4a] transition hover:border-[#8f2039] hover:bg-[#fff6f7] hover:text-[#8f2039] dark:border-[#514145] dark:bg-[#382f32] dark:text-[#d9d0d0]"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9090]"
            />

            <input
              value={naturalText}
              onChange={(event) =>
                setNaturalText(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleNaturalLanguage();
                }
              }}
              placeholder="Ramesh ko 500 diye"
              className="h-12 w-full rounded-xl border border-[#dcd5cd] bg-[#faf9f7] pl-11 pr-4 text-sm outline-none transition focus:border-[#8f2039] focus:ring-2 focus:ring-[#8f2039]/10 dark:border-[#4c3d41] dark:bg-[#282124] dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleNaturalLanguage}
            className="h-12 shrink-0 rounded-xl bg-[#741f2c] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#5f1722] hover:shadow-md active:scale-[0.98]"
          >
            Understand
          </button>
        </div>
      </section>

      {/* TRANSACTION LIST */}
      <section className="overflow-hidden rounded-[20px] border border-[#ddd6ce] bg-white shadow-[0_8px_30px_rgba(73,45,30,0.04)] dark:border-[#493a3e] dark:bg-[#30272a]">
        <div className="flex flex-col gap-3 border-b border-[#e5ded7] p-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#493a3e]">
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
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search transactions"
              className="h-10 w-full rounded-lg border border-[#ded7cf] bg-[#faf9f7] pl-9 pr-3 text-sm outline-none focus:border-[#8f2039] dark:border-[#4c3d41] dark:bg-[#282124] dark:text-white"
            />
          </div>
        </div>

        {filteredItems.length ? (
          <div>
            {filteredItems.map((item) => {
              const status =
                getStatus(item);

              const isPayment =
                item.type === "payment";

              return (
                <div
                  key={item.id}
                  className="group flex flex-col gap-3 border-b border-[#e7e1db] px-5 py-4 transition hover:bg-[#faf8f5] last:border-0 dark:border-[#493a3e] dark:hover:bg-[#372d30] sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full ${
                        isPayment
                          ? "bg-[#e8f3ed] text-[#468264]"
                          : "bg-[#f5e7e9] text-[#7b2330]"
                      }`}
                    >
                      {isPayment ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <FileText size={15} />
                      )}
                    </span>

                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-semibold text-[#373131] dark:text-[#f2ebeb]">
                        {getCustomerName(
                          item.customerId,
                        )}
                      </strong>

                      <p className="mt-0.5 truncate text-xs text-[#827879] dark:text-[#aaa0a2]">
                        {formatDate(
                          item.date,
                        )}
                        {" · "}
                        {item.method ||
                          "UPI"}
                        {item.notes
                          ? ` · ${item.notes}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        status === "settled"
                          ? "bg-[#edf5ef] text-[#43805f] dark:bg-[#293d31] dark:text-[#9bd0ad]"
                          : status === "overdue"
                            ? "bg-[#c8232c] text-white"
                            : "bg-[#f3eee6] text-[#7b5b42] dark:bg-[#4a3a30] dark:text-[#e2c4a3]"
                      }`}
                    >
                      {status}
                    </span>

                    <strong
                      className={`min-w-[110px] text-right text-sm font-bold ${
                        isPayment
                          ? "text-[#468264]"
                          : "text-[#7b2335] dark:text-[#e7d7d8]"
                      }`}
                    >
                      {isPayment
                        ? "+"
                        : "-"}
                      {money(
                        item.amount,
                        currency,
                      )}
                    </strong>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...item,
                          })
                        }
                        title="Edit"
                        className="rounded-lg p-2 text-[#756b6c] transition hover:bg-[#f0e8e8] hover:text-[#8f2039] dark:hover:bg-[#4a393e]"
                      >
                        <Pencil
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteId(
                            item.id,
                          )
                        }
                        title="Delete"
                        className="rounded-lg p-2 text-[#756b6c] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <div className="grid size-14 place-items-center rounded-full bg-[#f4eeeb] text-[#8f2039] dark:bg-[#3b2e32]">
              <Search size={24} />
            </div>

            <h3 className="mt-4 font-semibold dark:text-white">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-[#8b8182]">
              Add a transaction to start tracking your money.
            </p>

            <button
              type="button"
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
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#302b2b] dark:text-white">
                  {form.id
                    ? "Edit transaction"
                    : "Add transaction"}
                </h2>

                <p className="mt-1 text-sm text-[#817778]">
                  Record money given or payment received.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm(null)
                }
                className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Customer">
                <select
                  value={
                    form.customerId
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      customerId:
                        event.target
                          .value,
                    })
                  }
                >
                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {customer.name}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Transaction type">
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type: event.target
                        .value,
                    })
                  }
                >
                  <option value="credit">
                    Money given / Credit
                  </option>
                  <option value="payment">
                    Payment received
                  </option>
                </select>
              </Field>

              <Field label="Amount">
                <input
                  required
                  min="1"
                  type="number"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount:
                        event.target
                          .value,
                    })
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
                    setForm({
                      ...form,
                      date: event.target
                        .value,
                    })
                  }
                />
              </Field>

              <Field label="Payment method">
                <select
                  value={form.method}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      method:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>
                    Bank Transfer
                  </option>
                  <option>Card</option>
                  <option>Cheque</option>
                </select>
              </Field>

              <Field label="Due date">
                <input
                  type="date"
                  value={
                    form.dueDate || ""
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dueDate:
                        event.target
                          .value,
                    })
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Notes">
                  <textarea
                    rows="3"
                    value={
                      form.notes || ""
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Add transaction details..."
                  />
                </Field>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setForm(null)
                }
                className="rounded-xl border border-[#ddd5cd] px-5 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#741f2c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5f1722]"
              >
                {form.id
                  ? "Save changes"
                  : "Save transaction"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VOICE MODAL */}
      {voiceOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={closeVoice}
        >
          <div
            className="w-full max-w-md rounded-[24px] border border-[#ddd6ce] bg-white p-6 text-center shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a] sm:p-8"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeVoice}
                className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f4e8e8] text-[#8f2039] dark:bg-[#493238]">
              <Mic size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#302b2b] dark:text-white">
              Voice transaction entry
            </h2>

            <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-[#756d6d] dark:text-[#aaa0a2]">
              Speak naturally. KhataOne will convert your voice into a transaction.
            </p>

            <select
              value={voiceLanguage}
              onChange={(event) =>
                setVoiceLanguage(
                  event.target.value,
                )
              }
              disabled={isListening}
              className="mx-auto mt-5 h-10 rounded-xl border border-[#ddd5cd] bg-[#faf9f7] px-3 text-sm outline-none focus:border-[#8f2039] dark:border-[#514145] dark:bg-[#282124] dark:text-white"
            >
              <option value="en-IN">
                English / Hinglish
              </option>
              <option value="hi-IN">
                Hindi
              </option>
              <option value="mr-IN">
                Marathi
              </option>
            </select>

            <button
              type="button"
              onClick={
                isListening
                  ? stopListening
                  : startListening
              }
              className={`mx-auto mt-6 grid size-24 place-items-center rounded-full text-white shadow-xl transition ${
                isListening
                  ? "animate-pulse bg-[#468264]"
                  : "bg-[#741f2c] hover:scale-105 hover:bg-[#5f1722]"
              }`}
            >
              {isListening ? (
                <Square
                  size={28}
                  fill="currentColor"
                />
              ) : (
                <Mic size={38} />
              )}
            </button>

            <p className="mt-3 text-xs font-bold uppercase tracking-[1px] text-[#8f2039] dark:text-[#e7bfc5]">
              {isListening
                ? "Listening..."
                : "Tap to speak"}
            </p>

            {naturalText && (
              <div className="mt-5 rounded-xl border border-[#eadfe0] bg-[#faf5f5] p-3 text-left dark:border-[#493a3e] dark:bg-[#382f32]">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8f2039]">
                  Recognized
                </p>

                <p className="mt-1 text-sm text-[#514a4a] dark:text-white">
                  {naturalText}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeVoice}
                className="flex-1 rounded-xl border border-[#ddd5cd] px-4 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!naturalText.trim()}
                onClick={() => {
                  closeVoice();
                  handleNaturalLanguage();
                }}
                className="flex-1 rounded-xl bg-[#741f2c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5f1722] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BILL SCANNER */}
      {scannerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={closeScanner}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#ddd6ce] bg-white p-6 shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a] sm:p-7"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-[#f4e7e8] text-[#8f2039] dark:bg-[#493238]">
                    <ScanLine size={18} />
                  </div>

                  <h2 className="text-xl font-bold text-[#302b2b] dark:text-white">
                    Bill scanner
                  </h2>
                </div>

                <p className="mt-2 text-sm text-[#756d6d] dark:text-[#aaa0a2]">
                  Upload a clear bill image and KhataOne will read the text and find the amount.
                </p>
              </div>

              <button
                type="button"
                onClick={closeScanner}
                className="rounded-lg p-2 text-[#777] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"
              >
                <X size={20} />
              </button>
            </div>

            {!scanFile && (
              <label className="mt-6 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-[#d8cec8] bg-[#fdfbf9] px-5 py-10 text-center transition hover:border-[#8f2039] hover:bg-[#fff8f8] dark:border-[#514145] dark:bg-[#282124]">
                <div className="grid size-14 place-items-center rounded-2xl bg-[#f5e8e9] text-[#8f2039] dark:bg-[#493238]">
                  <Upload size={25} />
                </div>

                <span className="mt-4 text-sm font-bold text-[#40393a] dark:text-white">
                  Choose a bill image
                </span>

                <span className="mt-1 text-xs text-[#827879]">
                  JPG, PNG or PDF · Max 10 MB
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(event) =>
                    scanBill(
                      event.target
                        .files?.[0],
                    )
                  }
                />
              </label>
            )}

            {scanFile && (
              <div className="mt-5 space-y-4">
                {scanPreview && (
                  <div className="overflow-hidden rounded-xl border border-[#e3dcd6] bg-[#faf8f5] dark:border-[#493a3e] dark:bg-[#282124]">
                    <img
                      src={scanPreview}
                      alt="Bill preview"
                      className="max-h-64 w-full object-contain"
                    />
                  </div>
                )}

                {!scanPreview && (
                  <div className="flex items-center gap-3 rounded-xl bg-[#f7f2ef] p-4 dark:bg-[#382f32]">
                    <FileText
                      size={22}
                      className="text-[#8f2039]"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold dark:text-white">
                        {scanFile.name}
                      </p>
                      <p className="text-xs text-[#827879]">
                        PDF document
                      </p>
                    </div>
                  </div>
                )}

                {scanning ? (
                  <div className="flex items-center justify-center gap-3 rounded-xl bg-[#faf4f4] p-5 text-sm font-semibold text-[#8f2039] dark:bg-[#382f32]">
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Reading bill...
                  </div>
                ) : scanText ? (
                  <div className="rounded-xl border border-[#e3dcd6] bg-[#faf9f7] p-4 dark:border-[#493a3e] dark:bg-[#282124]">
                    <div className="flex items-center gap-2 text-[#43805f]">
                      <CheckCircle2
                        size={17}
                      />
                      <span className="text-xs font-bold">
                        Bill text detected
                      </span>
                    </div>

                    <p className="mt-3 max-h-28 overflow-y-auto text-xs leading-5 text-[#62595a] dark:text-[#d8cdcf]">
                      {scanText}
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="flex-1 rounded-xl border border-[#ddd5cd] px-4 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
                  >
                    Choose another
                  </button>

                  <button
                    type="button"
                    disabled={
                      scanning ||
                      !scanText
                    }
                    onClick={
                      useScannedBill
                    }
                    className="flex-1 rounded-xl bg-[#741f2c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5f1722] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Use details
                  </button>
                </div>
              </div>
            )}

            {!scanFile && (
              <button
                type="button"
                onClick={closeScanner}
                className="mt-5 w-full rounded-xl border border-[#ddd5cd] px-5 py-3 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* DELETE */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            setDeleteId(null)
          }
        >
          <div
            className="w-full max-w-sm rounded-[22px] border border-[#ddd6ce] bg-white p-6 shadow-2xl dark:border-[#493a3e] dark:bg-[#30272a]"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="grid size-11 place-items-center rounded-xl bg-[#fff0f1] text-[#b4232d] dark:bg-[#422c30]">
              <Trash2 size={20} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#302b2b] dark:text-white">
              Delete transaction?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756d6d] dark:text-[#aaa0a2]">
              This transaction will be removed from your khata permanently.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="rounded-xl border border-[#ddd5cd] px-4 py-2.5 text-sm font-semibold text-[#665d5e] dark:border-[#514145] dark:text-[#d7cecf]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-[#b4232d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#941c25]"
              >
                Delete
              </button>
            </div>
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