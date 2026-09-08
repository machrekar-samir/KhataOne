import {
  Link2,
  Mic,
  Plus,
  ScanLine,
  Send,
  UserRoundPlus,
} from "lucide-react";

export default function QuickActions({ onAction }) {
  const actions = [
    ["customer", UserRoundPlus, "Add", "Customer"],
    ["transaction", Plus, "Add", "Transaction"],
    ["voice", Mic, "Voice", "Entry"],
    ["scan", ScanLine, "Scan", "Bill"],
    ["reminder", Send, "Send", "Reminder"],
    ["link", Link2, "Payment", "Link"],
  ];

  return (
    <section className="h-[383px] rounded-[22px] border border-[#ddd6d0] bg-[#fffdfb] p-6 shadow-[0_4px_14px_rgba(73,48,35,0.04)] dark:border-[#423238] dark:bg-[#2a2024]">
      
      <h2 className="text-[18px] font-semibold text-[#423238] dark:text-white">
        Quick actions
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map(([id, Icon, line1, line2]) => (
          <button
            key={id}
            onClick={() => onAction?.(id)}
            className="
              group flex h-[94px] flex-col items-start justify-center
              gap-2 rounded-[20px] border border-[#ded8d3]
              bg-[#fffdfb] px-4 text-left
              text-[#51494b]
              transition-all duration-200 ease-out

              hover:-translate-y-1
              hover:border-[#c99e79]
              hover:bg-[#fdf5eb]
              hover:shadow-[0_8px_18px_rgba(122,38,51,0.10)]

              active:translate-y-0
              active:scale-[0.98]

              dark:border-[#423238]
              dark:bg-[#2a2024]
              dark:text-white
              dark:hover:bg-[#33262b]
            "
          >
            <div
              className="
                grid size-7 place-items-center
                text-[#7a2633]
                transition-all duration-200
                group-hover:scale-110
                group-hover:text-[#8f2039]
              "
            >
              <Icon
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <span className="text-[13px] font-medium leading-5">
              {line1}
              <br />
              {line2}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}