import { useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! I can help you understand your business and pending payments.",
    },
  ]);

  const suggestions = [
    "Pending payments?",
    "Recovery tips",
    "Customer risk",
  ];

  const sendMessage = (text = message) => {
    const value = text.trim();
    if (!value) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: value },
      {
        from: "ai",
        text: "I can help you with pending payments, collections, customer risk and recovery tips.",
      },
    ]);

    setMessage("");
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] grid h-14 w-14 place-items-center rounded-full bg-[#7b2633] text-white shadow-xl transition hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={23} />
        </button>
      )}

      {/* Chat + transparent outside click area */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          
          {/* Outside click closes - no blur/no background */}
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setOpen(false)}
          />

          {/* Chat */}
          <section
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 flex h-[520px] w-[390px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[22px] border border-[#e5ddd8] bg-[#fffdfb] shadow-2xl dark:border-[#4a3a40] dark:bg-[#251d21] sm:bottom-6 sm:right-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#7b2633] px-5 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                  <Bot size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold">KhataOne AI</h3>
                  <p className="text-[10px] text-white/70">
                    Business assistant · Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 transition hover:bg-white/10"
                aria-label="Close chatbot"
              >
                <X size={19} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${
                    item.from === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[13px] leading-6 ${
                      item.from === "user"
                        ? "bg-[#7b2633] text-white"
                        : "border border-[#e5ddd8] bg-[#faf8f6] text-[#51494b] dark:bg-[#30262b] dark:text-white"
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Small Suggestions */}
            <div className="border-t border-[#eee6e1] px-3 py-2">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => sendMessage(item)}
                    className="rounded-full border border-[#e2d5d1] px-3 py-1.5 text-[11px] font-medium text-[#7b2633] transition hover:border-[#7b2633] hover:bg-[#faf0f2]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-[#eee6e1] p-3">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  placeholder="Ask about your business..."
                  className="min-w-0 flex-1 rounded-xl border border-[#e1d8d2] bg-[#faf8f6] px-3 py-2.5 text-xs outline-none transition focus:border-[#7b2633]"
                />

                <button
                  onClick={() => sendMessage()}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7b2633] text-white transition hover:bg-[#651d29]"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}