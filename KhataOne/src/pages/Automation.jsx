import { useEffect, useMemo, useState } from "react";

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
  CircleDollarSign,
  X,
  Trash2,
  Save,
} from "lucide-react";

import { useAuth } from "../context/useAuth.js";

import {
  addAutomation,
  deleteAutomation,
  initializeAutomations,
  subscribeToAutomations,
  updateAutomation,
} from "../services/automationService.js";

import { subscribeToReminders } from "../services/reminderService.js";
import { subscribeToTransactions } from "../services/transactionService.js";

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

const icons = {
  calendar: CalendarDays,
  clock: Clock3,
  user: UserRound,
  bell: Bell,
  mail: Mail,
  zap: Zap,
};

export default function Automation() {
  const { user } = useAuth();

  const [workflows, setWorkflows] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(null);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setWorkflows([]);
      setReminders([]);
      setTransactions([]);
      return;
    }

    setLoading(true);

    initializeAutomations(user.uid).catch(
      (error) =>
        console.error(
          "Automation initialization error:",
          error,
        ),
    );

    const unsubAutomation =
      subscribeToAutomations(
        user.uid,
        (items) => {
          setWorkflows(items);
          setLoading(false);
        },
      );

    const unsubReminders =
      subscribeToReminders(
        user.uid,
        setReminders,
      );

    const unsubTransactions =
      subscribeToTransactions(
        user.uid,
        setTransactions,
      );

    return () => {
      unsubAutomation();
      unsubReminders();
      unsubTransactions();
    };
  }, [user?.uid]);

  const stats = useMemo(() => {
    const now = new Date();

    const getDate = (value) => {
      if (!value) return null;

      if (value?.toDate) {
        return value.toDate();
      }

      if (value?.seconds) {
        return new Date(
          value.seconds * 1000,
        );
      }

      const date = new Date(value);

      return Number.isNaN(date.getTime())
        ? null
        : date;
    };

    const start = new Date(now);
    const previousStart = new Date(now);

    if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      previousStart.setMonth(
        previousStart.getMonth() - 1,
        1,
      );
      previousStart.setHours(0, 0, 0, 0);
    }

    if (period === "last") {
      start.setMonth(
        start.getMonth() - 1,
        1,
      );
      start.setHours(0, 0, 0, 0);

      previousStart.setMonth(
        previousStart.getMonth() - 2,
        1,
      );
      previousStart.setHours(0, 0, 0, 0);
    }

    if (period === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);

      previousStart.setFullYear(
        previousStart.getFullYear() - 1,
        0,
        1,
      );
      previousStart.setHours(0, 0, 0, 0);
    }

    const inPeriod = (value) => {
      const date = getDate(value);

      return date && date >= start;
    };

    const monthReminders =
      reminders.filter((item) =>
        inPeriod(item.createdAt),
      );

    const payments =
      transactions.filter(
        (item) =>
          String(item.type || "").toLowerCase() ===
            "payment" &&
          inPeriod(
            item.date || item.createdAt,
          ),
      );

    const sent = monthReminders.filter(
      (item) =>
        ["sent", "completed"].includes(
          String(
            item.status || "",
          ).toLowerCase(),
        ),
    ).length;

    const recovered =
      payments.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0,
      );

    const deliveryRate =
      monthReminders.length
        ? Math.round(
            (sent /
              monthReminders.length) *
              100,
          )
        : 0;

    return {
      reminders: monthReminders.length,
      payments: payments.length,
      recovered,
      deliveryRate,
    };
  }, [
    reminders,
    transactions,
    period,
  ]);

  const toggle = async (workflow) => {
    try {
      await updateAutomation(
        user.uid,
        workflow.id,
        {
          status:
            workflow.status === "Active"
              ? "Paused"
              : "Active",
        },
      );
    } catch (error) {
      console.error(
        "Toggle error:",
        error,
      );
    }
  };

  const createAutomation = async () => {
    try {
      await addAutomation(
        user.uid,
        {
          title: "Custom automation",
          detail:
            "Create your own workflow with custom conditions",
          action: "Friendly reminder",
          actionDetail:
            "Configure your next follow-up",
          status: "Paused",
          tone: "green",
          icon: "zap",
          actionIcon: "bell",
        },
      );
    } catch (error) {
      console.error(
        "Create automation error:",
        error,
      );
    }
  };

  const saveEdit = async () => {
    if (!editing?.id) return;

    try {
      await updateAutomation(
        user.uid,
        editing.id,
        {
          title: editing.title,
          detail: editing.detail,
          action: editing.action,
          actionDetail:
            editing.actionDetail,
          status: editing.status,
        },
      );

      setEditing(null);
    } catch (error) {
      console.error(
        "Edit automation error:",
        error,
      );
    }
  };

  const remove = async (id) => {
    try {
      await deleteAutomation(
        user.uid,
        id,
      );

      setMenu(null);
    } catch (error) {
      console.error(
        "Delete automation error:",
        error,
      );
    }
  };

  return (
    <div
      className="w-full space-y-5 pb-8"
      onClick={() => setMenu(null)}
    >

      {/* HERO */}
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
              onClick={(e) => {
                e.stopPropagation();
                createAutomation();
              }}
              className="flex shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#8f2039] px-5 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#731b30] active:scale-95"
            >
              <Plus size={16} />
              Create automation
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
            <Benefit icon={Zap} text="Automate follow-ups" />
            <Benefit icon={Clock3} text="Save time" />
            <Benefit icon={Users} text="Improve collections" />
            <Benefit icon={ShieldCheck} text="Professional communication" />
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 top-5 hidden w-[360px] lg:block">
          <AutomationVisual />
        </div>
      </section>

      {/* MAIN */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,.8fr)]">

        <div className="space-y-4">

          {loading ? (
            <div className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-8 text-center text-sm text-[#777]">
              Loading automations...
            </div>
          ) : workflows.length === 0 ? (
            <div className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-8 text-center dark:bg-[#2b2226]">
              <p className="text-sm text-[#68748a]">
                No automations yet.
              </p>

              <button
                onClick={createAutomation}
                className="mt-4 rounded-lg bg-[#8f2039] px-4 py-2 text-xs font-bold text-white"
              >
                Create automation
              </button>
            </div>
          ) : (
            workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                toggle={toggle}
                remove={remove}
                menu={menu}
                setMenu={setMenu}
                setEditing={setEditing}
              />
            ))
          )}

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
                  Create your own workflow with custom conditions and messages.
                </p>
              </div>
            </div>

            <span className="flex items-center justify-center gap-2 rounded-[8px] bg-[#8f2039] px-5 py-2.5 text-[11px] font-bold text-white">
              <Plus size={15} />
              Create automation
            </span>
          </button>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-4 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3
                  size={18}
                  className="text-[#8f2039]"
                />

                <h2 className="text-[15px] font-bold text-[#17233c] dark:text-white">
                  Automation stats
                </h2>
              </div>

              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value)
                }
                className="rounded-lg border border-[#ddd5d0] bg-white px-2.5 py-2 text-[10px] text-[#596477] outline-none dark:border-[#493b40] dark:bg-[#32272b]"
              >
                <option value="month">
                  This Month
                </option>
                <option value="last">
                  Last Month
                </option>
                <option value="year">
                  This Year
                </option>
              </select>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <StatBox
                icon={Send}
                value={stats.reminders}
                label="Reminders sent"
                tone="pink"
              />

              <StatBox
                icon={Users}
                value={stats.payments}
                label="Payments received"
                tone="green"
              />

              <StatBox
                icon={CircleDollarSign}
                value={`₹${stats.recovered.toLocaleString("en-IN")}`}
                label="Recovered amount"
                tone="pink"
              />

              <StatBox
                icon={CheckCircle2}
                value={`${stats.deliveryRate}%`}
                label="Delivery rate"
                tone="green"
              />
            </div>
          </section>

          <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">
            <div className="flex items-center gap-2">
              <Lightbulb
                size={20}
                className="text-[#8f2039]"
              />

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

                <button
                  onClick={() => setGuide(true)}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-[#8f2039] px-4 py-2 text-[10px] font-bold text-[#7a2633] transition hover:bg-[#8f2039] hover:text-white"
                >
                  View Guide
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#17233c] dark:text-white">
              Edit automation
            </h2>

            <button
              onClick={() => setEditing(null)}
              className="rounded-lg p-2 hover:bg-[#f5eeee]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <Field
              label="Title"
              value={editing.title}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  title: value,
                })
              }
            />

            <Field
              label="Condition"
              value={editing.detail}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  detail: value,
                })
              }
            />

            <Field
              label="Action"
              value={editing.action}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  action: value,
                })
              }
            />

            <Field
              label="Action detail"
              value={editing.actionDetail}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  actionDetail: value,
                })
              }
            />

            <select
              value={editing.status}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  status: e.target.value,
                })
              }
              className="w-full rounded-xl border border-[#ddd5d0] bg-white px-3 py-3 text-sm outline-none focus:border-[#8f2039]"
            >
              <option>Active</option>
              <option>Paused</option>
            </select>
          </div>

          <button
            onClick={saveEdit}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8f2039] py-3 text-sm font-bold text-white hover:bg-[#731b30]"
          >
            <Save size={16} />
            Save changes
          </button>
        </Modal>
      )}

      {/* GUIDE MODAL */}
      {guide && (
        <Modal onClose={() => setGuide(false)}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#17233c] dark:text-white">
              Automation guide
            </h2>

            <button
              onClick={() => setGuide(false)}
              className="rounded-lg p-2 hover:bg-[#f5eeee]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-6 text-[#68748a]">
            <p>
              <b>1. Payment due:</b> Activate this workflow when you want
              reminders around the due date.
            </p>

            <p>
              <b>2. Payment overdue:</b> Use this workflow for customers
              whose payment remains pending after the due date.
            </p>

            <p>
              <b>3. Owner alert:</b> Keep this active when you want an
              owner-side alert for risky or delayed payments.
            </p>

            <p>
              Use <b>Edit</b> to change the workflow details and the
              toggle to activate or pause it.
            </p>
          </div>

          <button
            onClick={() => setGuide(false)}
            className="mt-5 w-full rounded-xl bg-[#8f2039] py-3 text-sm font-bold text-white"
          >
            Got it
          </button>
        </Modal>
      )}
    </div>
  );
}

function WorkflowCard({
  workflow,
  toggle,
  remove,
  menu,
  setMenu,
  setEditing,
}) {
  const Icon =
    icons[workflow.icon] || Zap;

  const ActionIcon =
    icons[workflow.actionIcon] || Bell;

  const colors =
    tone[workflow.tone] || tone.green;

  return (
    <section className="rounded-[16px] border border-[#e5ddd8] bg-[#fffdfb] p-5 shadow-sm transition hover:shadow-md dark:border-[#423238] dark:bg-[#2b2226]">

      <div className="flex items-start gap-4">
        <div
          className={`grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[14px] ${colors.box}`}
        >
          <Icon size={25} />
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

        <button
          onClick={() => toggle(workflow)}
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

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu(
                menu === workflow.id
                  ? null
                  : workflow.id,
              );
            }}
            className="rounded-lg p-1.5 text-[#687181] hover:bg-[#f5eeee] hover:text-[#8f2039]"
          >
            <MoreVertical size={18} />
          </button>

          {menu === workflow.id && (
            <div
              onClick={(e) =>
                e.stopPropagation()
              }
              className="absolute right-0 top-9 z-20 w-32 rounded-xl border border-[#e5ddd8] bg-white p-1.5 shadow-xl dark:border-[#493b40] dark:bg-[#30262b]"
            >
              <button
                onClick={() => {
                  setEditing({
                    ...workflow,
                  });
                  setMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-[#faf1f2]"
              >
                <Pencil size={13} />
                Edit
              </button>

              <button
                onClick={() =>
                  remove(workflow.id)
                }
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#b63e4d] hover:bg-[#fff0f1]"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`mt-4 flex items-center gap-3 rounded-[12px] px-4 py-3 ${colors.action}`}
      >
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

        <button
          onClick={() =>
            setEditing({
              ...workflow,
            })
          }
          className="flex items-center gap-1.5 rounded-lg border border-[#d9d7d4] bg-white px-3 py-2 text-[10px] font-semibold text-[#263047] shadow-sm hover:border-[#8f2039] hover:text-[#8f2039]"
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-[#68748a]">
        {label}
      </span>

      <input
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-[#ddd5d0] bg-white px-3 py-3 text-sm outline-none focus:border-[#8f2039]"
      />
    </label>
  );
}

function Modal({
  children,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="w-full max-w-[480px] rounded-2xl bg-[#fffdfb] p-5 shadow-2xl dark:bg-[#2b2226]"
      >
        {children}
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-medium text-[#3f4655] dark:text-[#d2c8cb]">
      <Icon
        size={17}
        className="text-[#8f2039]"
      />
      {text}
    </div>
  );
}

function StatBox({
  icon: Icon,
  value,
  label,
  tone: boxTone,
}) {
  return (
    <div className="rounded-xl bg-[#fcfaf8] p-3 dark:bg-[#32272b]">
      <span
        className={`grid h-9 w-9 place-items-center rounded-lg ${
          boxTone === "green"
            ? "bg-[#e8f5ed] text-[#31906a]"
            : "bg-[#fbe9ee] text-[#8f2039]"
        }`}
      >
        <Icon size={17} />
      </span>

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