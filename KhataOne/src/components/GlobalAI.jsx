import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useApp } from "../context/useApp.js";

export default function GlobalAI() {
  const { customers = [], data } = useApp();

  const transactions = data?.transactions || [];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! I'm KhataOne AI. Ask me anything about your business.",
    },
  ]);

  const pending = customers.reduce(
    (sum, item) => sum + Number(item.outstanding || 0),
    0,
  );

  const sendMessage = (text = input) => {
    const question = String(text || "").trim();

    if (!question) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: question },
    ]);

    setInput("");

    setTimeout(() => {
      const q = question.toLowerCase();

      let reply =
        "I can help you analyze customers, payments, pending money and business activity.";

      if (
        q.includes("pending") ||
        q.includes("due") ||
        q.includes("outstanding")
      ) {
        reply =
          pending > 0
            ? `Your total pending amount is ₹${pending.toLocaleString("en-IN")}. Focus on overdue customers first.`
            : "Great! You currently have no pending amount.";
      } else if (q.includes("customer")) {
        reply = `You currently have ${customers.length} customers in your workspace.`;
      } else if (
        q.includes("transaction") ||
        q.includes("sale") ||
        q.includes("income")
      ) {
        reply = `You currently have ${transactions.length} transactions recorded.`;
      } else if (
        q.includes("recover") ||
        q.includes("collection")
      ) {
        const risky = customers.filter(
          (item) =>
            Number(item.outstanding || 0) > 0 &&
            Number(item.score || 100) < 75,
        );

        reply = risky.length
          ? `${risky.length} customers need priority follow-up for better recovery.`
          : "Your collection status currently looks healthy.";
      } else if (q.includes("help")) {
        reply =
          "You can ask me about pending payments, customer risk, collections, transactions or business performance.";
      }

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: reply },
      ]);
    }, 450);
  };

  const prompts = [
    "Pending amount?",
    "Recovery tips",
    "Customer risk",
  ];

  return (
    <>
      {/* Floating AI Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 rounded-full bg-[#6b1d2b] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(107,29,43,0.35)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#541521] hover:shadow-[0_16px_35px_rgba(107,29,43,0.45)] active:scale-95"
      >
        <span className="relative grid size-5 place-items-center">
          <Bot size={20} />

          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#75d68d] ring-2 ring-[#6b1d2b]" />
        </span>

        <span className="hidden sm:block">
          Ask AI
        </span>
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close AI"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[1px]"
          />

          {/* Chat */}
          <section className="absolute bottom-5 right-5 flex h-[min(600px,calc(100vh-40px))] w-[calc(100%-40px)] max-w-[400px] flex-col overflow-hidden rounded-[24px] border border-[#e4ddd5] bg-[#fffdfb] shadow-2xl dark:border-[#423238] dark:bg-[#2a2024]">
            
            {/* Header */}
            <header className="flex items-center justify-between bg-[#6b1d2b] px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-white/15">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    KhataOne AI
                  </h3>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/70">
                    <span className="size-1.5 rounded-full bg-[#75d68d]" />
                    Business Assistant
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-xl transition hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#faf8f6] p-4 dark:bg-[#21191c]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.from === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.from === "ai" && (
                    <div className="mr-2 mt-1 grid size-7 shrink-0 place-items-center rounded-lg bg-[#f4e6e9] text-[#8f2039]">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                      message.from === "user"
                        ? "rounded-br-md bg-[#6b1d2b] text-white"
                        : "rounded-bl-md border border-[#e8e1dc] bg-white text-[#51494b] dark:border-[#423238] dark:bg-[#30262a] dark:text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="flex gap-2 overflow-x-auto border-t border-[#eee7e2] bg-white px-3 py-2.5 dark:border-[#423238] dark:bg-[#2a2024]">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-[#ead9dd] px-3 py-1.5 text-[10px] font-medium text-[#8f2039] transition hover:bg-[#f8eaed]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 border-t border-[#eee7e2] bg-white p-3 dark:border-[#423238] dark:bg-[#2a2024]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your business..."
                className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4ddd5] bg-[#faf8f6] px-3 text-xs text-[#423238] outline-none transition focus:border-[#8f2039] dark:border-[#423238] dark:bg-[#33282c] dark:text-white"
              />

              <button
                type="submit"
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#6b1d2b] text-white transition hover:bg-[#541521] active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}