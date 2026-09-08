import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Modal from "../components/Modal.jsx";
import StatCard from "../components/StatCard.jsx";
import MoneyStuckCard from "../components/MoneyStuckCard.jsx";
import BusinessHealth from "../components/BusinessHealth.jsx";
import AIInsights from "../components/AIInsights.jsx";
import CashFlowChart from "../components/CashFlowChart.jsx";
import QuickActions from "../components/QuickActions.jsx";

export default function Overview() {
  const { data, customers = [], totals = {} } = useApp();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState("");

  const transactions = data?.transactions || [];

  // Currency formatter - INR text nahi aayega
  const money = (value = 0) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const dashboard = useMemo(() => {
    const now = new Date();

    const receivable = customers.reduce(
      (sum, customer) => sum + Number(customer.outstanding || 0),
      0,
    );

    const overdueCustomers = customers.filter(
      (customer) =>
        Number(customer.outstanding || 0) > 0 &&
        customer.overdue?.length,
    );

    const overdue = overdueCustomers.reduce(
      (sum, customer) => sum + Number(customer.outstanding || 0),
      0,
    );

    const payable = transactions
      .filter(
        (item) =>
          item.type === "payable" ||
          item.type === "expense",
      )
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const collectedThisMonth = transactions
      .filter((item) => {
        const date = new Date(item.date);

        return (
          (item.type === "payment" ||
            item.type === "received" ||
            item.type === "collection") &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    const todayCollected = transactions
      .filter((item) => {
        if (
          item.type !== "payment" &&
          item.type !== "received" &&
          item.type !== "collection"
        ) {
          return false;
        }

        return (
          new Date(item.date).toDateString() ===
          now.toDateString()
        );
      })
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      );

    return {
      receivable,
      overdue,
      payable,
      collectedThisMonth,
      todayCollected,
      receivableCustomers: customers.filter(
        (customer) => Number(customer.outstanding || 0) > 0,
      ).length,
      overdueCustomers: overdueCustomers.length,
    };
  }, [customers, transactions]);

  const attention = useMemo(() => {
    return [...customers]
      .filter((item) => Number(item.outstanding || 0) > 0)
      .sort((a, b) => Number(a.score || 100) - Number(b.score || 100));
  }, [customers]);

  const groups = useMemo(() => {
    const critical = attention
      .filter((item) => item.overdue?.length && Number(item.score || 100) < 50)
      .reduce(
        (sum, item) => sum + Number(item.outstanding || 0),
        0,
      );

    const high = attention
      .filter(
        (item) =>
          item.overdue?.length &&
          Number(item.score || 100) >= 50 &&
          Number(item.score || 100) < 75,
      )
      .reduce(
        (sum, item) => sum + Number(item.outstanding || 0),
        0,
      );

    const dueSoon = attention
      .filter((item) => !item.overdue?.length)
      .reduce(
        (sum, item) => sum + Number(item.outstanding || 0),
        0,
      );

    return [
      {
        label: "Critical (30+ days)",
        amount: critical,
      },
      {
        label: "High priority (15–30 days)",
        amount: high,
      },
      {
        label: "Due soon",
        amount: dueSoon,
      },
      {
        label: "Recently added",
        amount: 0,
      },
    ];
  }, [attention]);

  const openAction = (action) => {
    if (action === "customer") navigate("/customers");
    else if (action === "transaction") navigate("/transactions");
    else if (action === "reminder") navigate("/collections");
    else setWorkflow(action);
  };

  const userName =
    data?.profile?.name?.split(" ")[0] || "User";

  return (
    <div className="mx-auto w-full max-w-[1450px] space-y-7 pb-8">

      {/* Welcome */}
      <section className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#423238] dark:text-white md:text-[30px]">
            Welcome back, {userName}
          </h1>

          <p className="mt-1 text-sm text-[#756d70] dark:text-[#b9adb1]">
            Here is your business performance and money recovery overview.
          </p>
        </div>

        <button
          onClick={() => navigate("/collections")}
          className="flex items-center gap-2 rounded-xl bg-[#6b1d2b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#541521]"
        >
          Recover money
          <span className="text-lg">→</span>
        </button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total receivable"
          value={money(dashboard.receivable)}
          detail={`${dashboard.receivableCustomers} customers pending`}
          type="receivable"
        />

        <StatCard
          label="Total payable"
          value={money(dashboard.payable)}
          detail={
            dashboard.payable > 0
              ? "Business expenses pending"
              : "No pending payable"
          }
          type="payable"
          tone="blue"
        />

        <StatCard
          label="Overdue amount"
          value={money(dashboard.overdue)}
          detail={`${dashboard.overdueCustomers} customers need attention`}
          type="overdue"
          tone="red"
        />

        <StatCard
          label="Collected this month"
          value={money(dashboard.collectedThisMonth)}
          detail={`Today ${money(dashboard.todayCollected)}`}
          type="collected"
          tone="green"
        />

      </section>

      {/* Money + Health */}
      <section className="grid gap-5 xl:grid-cols-[1.7fr_0.8fr]">

        <MoneyStuckCard
          groups={groups}
          total={dashboard.receivable}
          money={money}
          onRemind={() => navigate("/collections")}
        />

        <BusinessHealth
          customers={customers}
          transactions={transactions}
          receivable={dashboard.receivable}
          overdue={dashboard.overdue}
          collected={dashboard.collectedThisMonth}
        />

      </section>

      {/* AI */}
      <section>
        <AIInsights
          risky={attention.filter((item) => Number(item.score || 100) < 75).slice(0, 3)}
          likely={attention.filter((item) => Number(item.score || 100) >= 75).slice(0, 3)}
          money={money}
        />
      </section>

      {/* Chart */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

        <CashFlowChart transactions={transactions} />

        <QuickActions onAction={openAction} />

      </section>

      {/* Modal */}
      {workflow && (
        <Modal
          title={
            workflow === "voice"
              ? "Voice entry"
              : workflow === "scan"
                ? "Scan bill"
                : "Payment link"
          }
          close={() => setWorkflow("")}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#8b8383]">
              {workflow === "voice"
                ? "Voice entry is ready for your next transaction."
                : workflow === "scan"
                  ? "Bill scanner is ready to capture a new expense."
                  : "Payment link generation is ready for a customer."}
            </p>

            <button
              className="rounded-lg bg-[#8f2039] px-5 py-2.5 text-xs font-bold text-white"
              onClick={() => setWorkflow("")}
            >
              Continue
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}