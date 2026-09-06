import { useState } from "react";
import { Heading, PanelHeading } from "../components/PageParts.jsx";

const defaultWorkflows = [
  {
    id: "due",
    title: "Payment due",
    detail: "When an invoice reaches its due date",
    action: "Friendly reminder",
    status: "Active",
  },
  {
    id: "overdue",
    title: "Payment overdue",
    detail: "Three days after the due date",
    action: "Professional reminder",
    status: "Active",
  },
  {
    id: "owner",
    title: "Owner alert",
    detail: "When a payment is more than 15 days late",
    action: "Notify owner",
    status: "Paused",
  },
];
export default function Automation() {
  const [workflows, setWorkflows] = useState(defaultWorkflows);
  const toggle = (id) =>
    setWorkflows((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Paused" : "Active" }
          : item,
      ),
    );
  return (
    <Heading
      eyebrow="COLLECTION WORKFLOWS"
      title="Collection automation"
      action="Create automation"
      onAction={() =>
        setWorkflows((items) => [
          ...items,
          {
            id: `new-${items.length}`,
            title: "New workflow",
            detail: "Ready to configure",
            action: "Friendly reminder",
            status: "Paused",
          },
        ])
      }
    >
      <div className="mb-4 rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226]">
        <PanelHeading
          eyebrow="SMART RECOVERY"
          title="Keep every follow-up moving"
        />
        <p className="text-sm text-[#8b8383]">
          Build calm, consistent payment journeys that run in the background.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#8f2039]">
          {[
            "Payment due",
            "Friendly reminder",
            "Professional reminder",
            "Owner alert",
          ].map((item, index) => (
            <span key={item}>
              {index > 0 && <b className="mr-2 text-[#8b8383]">↓</b>}
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div
            className="flex flex-col gap-4 rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226] sm:flex-row sm:items-center"
            key={workflow.id}
          >
            <div className="flex-1">
              <p className="mb-1 text-[9px] font-bold tracking-[1.2px] text-[#aaa0a0]">
                TRIGGER
              </p>
              <h2 className="font-serif text-lg font-bold">{workflow.title}</h2>
              <p className="text-sm text-[#8b8383]">{workflow.detail}</p>
            </div>
            <div className="text-xs">
              <span className="block text-[9px] text-[#8b8383]">THEN</span>
              <strong>{workflow.action}</strong>
            </div>
            <button
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${workflow.status === "Active" ? "bg-[#e7f2eb] text-[#468264]" : "bg-[#f1eee9] text-[#8b8383]"}`}
              onClick={() => toggle(workflow.id)}
            >
              {workflow.status}
            </button>
            <button
              className="text-left text-xs font-bold text-[#bf6873]"
              onClick={() =>
                setWorkflows((items) =>
                  items.filter((item) => item.id !== workflow.id),
                )
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Heading>
  );
}
