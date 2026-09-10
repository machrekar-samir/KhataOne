import { useState } from "react";
import {
  Plus,
  Zap,
  Clock3,
  Users,
  ShieldCheck,
  CalendarDays,
  UserRound,
  Bell,
  Mail,
  Pencil,
  MoreVertical,
  Send,
  Lightbulb,
  CheckCircle2,
  Headphones,
  ArrowRight,
  BarChart3,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

const defaultWorkflows = [
  {
    id: "due",
    title: "Payment due",
    detail: "When an invoice reaches its due date",
    action: "Send a friendly reminder",
    actionDetail: "Notify customer on the due date",
    status: "Active",
    tone: "green",
    icon: CalendarDays,
    actionIcon: UserRound,
  },
  {
    id: "overdue",
    title: "Payment overdue",
    detail: "Three days after the due date",
    action: "Send a professional reminder",
    actionDetail: "Notify customer 3 days after due date",
    status: "Active",
    tone: "amber",
    icon: Clock3,
    actionIcon: Mail,
  },
  {
    id: "owner",
    title: "Owner alert",
    detail: "When a payment is more than 15 days late",
    action: "Notify owner",
    actionDetail: "Send an alert to business owner",
    status: "Paused",
    tone: "red",
    icon: UserRound,
    actionIcon: Bell,
  },
];

const tone = {
  green: {
    box: "bg-[#e8f5ed] text-[#25815b]",
    action: "bg-[#f5fbf7]",
  },
  amber: {
    box: "bg-[#fff3d7] text-[#d79512]",
    action: "bg-[#fffaf0]",
  },
  red: {
    box: "bg-[#fde8eb] text-[#c52e47]",
    action: "bg-[#fff7f7]",
  },
};

export default function Automation() {
  const [workflows, setWorkflows] = useState(defaultWorkflows);

  const toggle = (id) => {
    setWorkflows((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Active" ? "Paused" : "Active",
            }
          : item,
      ),
    );
  };

  const createAutomation = () => {
    setWorkflows((items) => [
      ...items,
      {
        id: `custom-${Date.now()}`,
        title: "Custom automation",
        detail: "Create your own workflow with custom conditions",
        action: "Friendly reminder",
        actionDetail: "Configure your next follow-up",
        status: "Paused",
        tone: "green",
        icon: Zap,
        actionIcon: Bell,
      },
    ]);
  };

  const remove = (id) => {
    setWorkflows((items) =>
      items.filter((item) => item.id !== id),
    );
  };

  return (
    <div className="w-full space-y-5 pb-8">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#fffdfb] via-[#fff9f7] to-[#f8eeeb] px-5 py-6 dark:from-[#2d2327] dark:via-[#2a2024] dark:to-[#32272b] sm:px-7 sm:py-7">

        <div className="relative z-10 max-w-[760px]">

          <p className="text-[10px] font-bold tracking-[1.8px] text-[#9d777d]">
            COLLECTION WORKFLOWS
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="font-serif text-[32px] font-bold leading-tight tracking-[-0.03em] text-[#10203d] dark:text-white sm:text-[40px]">
                Collection automation
              </h1>

              <p className="mt-2 max-w-[650px] text-[14px] leading-6 text-[#526078] dark:text-[#b9adb1] sm:text-[16px]">
                Set up automatic reminders and follow-ups so you never miss
                a collection.
                <br className="hidden sm:block" />
                Save time, stay consistent, and recover faster.
              </p>
            </div>

            <button
              onClick={createAutomation}
              className="flex shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#8f2039] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#731b30] hover:shadow-md active:scale-95"
            >
              <Plus size={16} />
              Create automation
            </button>
          </div>

          {/* BENEFITS */}
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
            <Benefit icon={Zap} text="Automate follow-ups" />
            <Benefit icon={Clock3} text="Save time" />
            <Benefit icon={Users} text="Improve collections" />
            <Benefit icon={ShieldCheck} text="Professional communication" />
          </div>
        </div>

        {/* DECORATION */}
        <div className="pointer-events-none absolute right-8 top-5 hidden w-[360px] lg:block">
          <AutomationVisual />
        </div>
      </section>

      {/* ================= MAIN GRID ================= */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,.8fr)]">

        {/* ================= LEFT ================= */}
        <div className="space-y-4">

          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              toggle={toggle}
              remove={remove}
            />
          ))}

          {/* CUSTOM */}
          <button
            onClick={createAutomation}
            className="group flex w-full flex-col gap-4 rounded-[16px] border border-[#ead9d6] bg-gradient-to-r from-[#fffafa] to-[#fffdfb] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#bd8790] hover:shadow-md dark:border-[#493b40] dark:bg-[#2b2226] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f9e7e9] text-[#8f2039]">
                <Plus size={23} />
              </span>

              <div>
                <h3 className="text-[14px] font-bold text-[#15213a] dark:text-white">
                  Custom automation
                </h3>

                <p className="mt-1 text-[11px] text-[#68748a]">
                  Create your own workflow with custom conditions and
                  messages.
                </p>
              </div>
            </div>

            <span className="flex items-center justify-center gap-2 rounded-[8px] bg-[#8f2039] px-5 py-2.5 text-[11px] font-bold text-white transition group-hover:bg-[#731b30]">
              <Plus size={15} />
              Create automation
            </span>
          </button>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-4">

          {/* STATS */}
          <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-4 shadow-[0_4px_15px_rgba(73,48,35,.04)] dark:border-[#423238] dark:bg-[#2b2226]">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#8f2039]" />

                <h2 className="text-[15px] font-bold text-[#17233c] dark:text-white">
                  Automation stats
                </h2>
              </div>

              <select className="rounded-lg border border-[#ddd5d0] bg-white px-2.5 py-2 text-[10px] text-[#596477] outline-none dark:border-[#493b40] dark:bg-[#32272b]">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <StatBox
                icon={Send}
                value="24"
                label="Reminders sent"
                growth="↑ 18%"
                tone="pink"
              />

              <StatBox
                icon={Users}
                value="16"
                label="Payments received"
                growth="↑ 27%"
                tone="green"
              />

              <StatBox
                icon={CircleDollarSign}
                value="₹48,500"
                label="Recovered amount"
                growth="↑ 32%"
                tone="pink"
              />

              <StatBox
                icon={CheckCircle2}
                value="92%"
                label="Delivery rate"
                growth="↑ 6%"
                tone="green"
              />
            </div>
          </section>

          {/* TIPS */}
          <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-[0_4px_15px_rgba(73,48,35,.04)] dark:border-[#423238] dark:bg-[#2b2226]">

            <div className="flex items-center gap-2">
              <Lightbulb size={20} className="text-[#8f2039]" />

              <h2 className="text-[15px] font-bold text-[#17233c] dark:text-white">
                Tips for better results
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              {[
                "Use a friendly tone for first reminder",
                "Send follow-ups at the right time",
                "Personalize messages with customer name",
                "Keep reminders short and clear",
                "Enable owner alerts for high-risk accounts",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 text-[11px] leading-5 text-[#5e697d]"
                >
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#62b793]"
                  />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* HELP */}
          <section className="relative overflow-hidden rounded-[16px] border border-[#eedbdc] bg-gradient-to-br from-[#fffafa] to-[#fdf0f0] p-5 dark:border-[#493b40] dark:from-[#302529] dark:to-[#35282c]">

            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f9e5e8] text-[#8f2039]">
                <Headphones size={20} />
              </span>

              <div>
                <h2 className="text-[15px] font-bold text-[#17233c] dark:text-white">
                  Need help?
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#68748a]">
                  Learn how to set up automation with our detailed guide.
                </p>

                <button className="mt-3 flex items-center gap-2 rounded-lg border border-[#8f2039] px-4 py-2 text-[10px] font-bold text-[#7a2633] transition hover:bg-[#8f2039] hover:text-white">
                  View Guide
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= WORKFLOW CARD ================= */

function WorkflowCard({ workflow, toggle, remove }) {
  const Icon = workflow.icon;
  const ActionIcon = workflow.actionIcon;
  const colors = tone[workflow.tone] || tone.green;

  return (
    <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-[0_4px_15px_rgba(73,48,35,.04)] transition hover:shadow-md dark:border-[#423238] dark:bg-[#2b2226]">

      {/* HEADER */}
      <div className="flex items-start gap-4">

        <div
          className={`grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[14px] ${colors.box}`}
        >
          <Icon size={25} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#15213a] dark:text-white">
              {workflow.title}
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                workflow.status === "Active"
                  ? "bg-[#e7f4ed] text-[#32815f]"
                  : "bg-[#f0efed] text-[#77716f]"
              }`}
            >
              {workflow.status}
            </span>
          </div>

          <p className="mt-1 text-[12px] text-[#647086]">
            {workflow.detail}
          </p>
        </div>

        {/* TOGGLE */}
        <button
          onClick={() => toggle(workflow.id)}
          aria-label={`Toggle ${workflow.title}`}
          className={`relative h-7 w-[54px] shrink-0 rounded-full transition ${
            workflow.status === "Active"
              ? "bg-[#8f2039]"
              : "bg-[#c8c8c8]"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
              workflow.status === "Active"
                ? "left-[30px]"
                : "left-1"
            }`}
          />
        </button>

        <button className="hidden text-[#687181] sm:block">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* ACTION */}
      <div className={`mt-4 flex items-center gap-3 rounded-[12px] px-4 py-3 ${colors.action}`}>

        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${colors.box}`}
        >
          <ActionIcon size={17} />
        </span>

        <div className="min-w-0 flex-1">
          <strong className="block text-[12px] font-bold text-[#263047] dark:text-white">
            {workflow.action}
          </strong>

          <span className="mt-0.5 block text-[10px] text-[#6e788b]">
            {workflow.actionDetail}
          </span>
        </div>

        <button className="hidden items-center gap-1.5 rounded-lg border border-[#d9d7d4] bg-white px-3 py-2 text-[10px] font-semibold text-[#263047] shadow-sm transition hover:border-[#8f2039] hover:text-[#8f2039] sm:flex">
          <Pencil size={12} />
          Edit
        </button>

        <button
          onClick={() => remove(workflow.id)}
          className="grid h-8 w-8 place-items-center rounded-lg text-[#7c7475] transition hover:bg-[#f5e7e8] hover:text-[#b63e4d] sm:hidden"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </section>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Benefit({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-medium text-[#3f4655] dark:text-[#d2c8cb]">
      <Icon size={17} className="text-[#8f2039]" />
      {text}
    </div>
  );
}

function StatBox({
  icon: Icon,
  value,
  label,
  growth,
  tone: boxTone,
}) {
  return (
    <div className="rounded-xl bg-[#fcfaf8] p-3 dark:bg-[#32272b]">
      <div className="flex items-start justify-between gap-1">
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${
            boxTone === "green"
              ? "bg-[#e8f5ed] text-[#31906a]"
              : "bg-[#fbe9ee] text-[#8f2039]"
          }`}
        >
          <Icon size={17} />
        </span>

        <span className="text-[9px] font-semibold text-[#24915e]">
          {growth}
        </span>
      </div>

      <strong className="mt-2 block text-[17px] font-bold text-[#17213a] dark:text-white">
        {value}
      </strong>

      <span className="text-[9px] text-[#747d8e]">
        {label}
      </span>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="relative h-[170px]">
      <div className="absolute right-20 top-3 rotate-[-5deg] rounded-xl border border-[#eadede] bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e4f4ec] text-[#299168]">
            <Mail size={18} />
          </span>

          <div>
            <strong className="block text-[10px] text-[#263047]">
              Payment Due
            </strong>
            <span className="text-[9px] text-[#7b8493]">
              Gentle reminder
            </span>
          </div>
        </div>
      </div>

      <div className="absolute right-8 top-[65px] rotate-[3deg] rounded-xl border border-[#eadede] bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fff0d5] text-[#d79113]">
            <Send size={18} />
          </span>

          <div>
            <strong className="block text-[10px] text-[#263047]">
              Still Pending?
            </strong>
            <span className="text-[9px] text-[#7b8493]">
              Follow up
            </span>
          </div>
        </div>
      </div>

      <div className="absolute right-20 top-[125px] rotate-[-4deg] rounded-xl border border-[#eadede] bg-white px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#fde6e9] text-[#c52e47]">
            <Bell size={18} />
          </span>

          <div>
            <strong className="block text-[10px] text-[#263047]">
              Overdue
            </strong>
            <span className="text-[9px] text-[#7b8493]">
              Take action
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}