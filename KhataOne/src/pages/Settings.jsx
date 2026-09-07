import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Building2, Languages, Bell, Workflow, Shield,
  Save, ChevronDown
} from "lucide-react";

export default function Settings() {
  const { data, update, notify } = useApp();
  const [tab, setTab] = useState("Business");
  const [business, setBusiness] = useState(data.business || {});
  const [toggles, setToggles] = useState({
    whatsapp: true, sms: true, email: true, payment: true,
    ai: true, escalate: true, stop: true
  });
  const [security, setSecurity] = useState({ current: "", password: "", twoFA: false });

  const tabs = [
    ["Business", Building2],
    ["Preferences", Languages],
    ["Notifications", Bell],
    ["Automation", Workflow],
    ["Security", Shield],
  ];

  const save = () => {
    update?.({ business });
    notify?.(`${tab} settings saved successfully`);
  };

  const Toggle = ({ name }) => (
    <button
      type="button"
      onClick={() => setToggles({ ...toggles, [name]: !toggles[name] })}
      className={`relative h-6 w-10 rounded-full transition ${toggles[name] ? "bg-[#70212b]" : "bg-gray-300"}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${toggles[name] ? "left-5" : "left-1"}`} />
    </button>
  );

  const Row = ({ title, text, name }) => (
    <div className="flex items-center justify-between rounded-[22px] border border-[#ddd5cc] px-4 py-4 sm:px-5">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-[#77706b]">{text}</p>
      </div>
      <Toggle name={name} />
    </div>
  );

  const Input = ({ label, value, onChange, type = "text" }) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-2xl border border-[#d8d0c8] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#70212b] focus:ring-2 focus:ring-[#70212b]/10"
      />
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[#716b66]">
          Manage your business profile, preferences and security.
        </p>
      </div>

      {/* Clickable Tabs */}
      <div className="mb-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#ece8e2] p-1.5">
        {tabs.map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
              tab === name
                ? "bg-white font-semibold shadow-sm"
                : "text-[#6f6863] hover:bg-white/60"
            }`}
          >
            <Icon size={16} />
            {name}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] border border-[#d8d0c8] bg-white p-5 shadow-sm sm:p-6">

        {/* BUSINESS */}
        {tab === "Business" && (
          <>
            <h2 className="mb-5 text-lg font-semibold">Business details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Business name" value={business.name}
                onChange={e => setBusiness({ ...business, name: e.target.value })} />
              <Input label="Owner name" value={business.owner || ""}
                onChange={e => setBusiness({ ...business, owner: e.target.value })} />
              <Input label="Business category" value={business.type}
                onChange={e => setBusiness({ ...business, type: e.target.value })} />
              <Input label="Mobile number" value={business.phone}
                onChange={e => setBusiness({ ...business, phone: e.target.value })} />
              <div className="md:col-span-2">
                <Input label="Address" value={business.address}
                  onChange={e => setBusiness({ ...business, address: e.target.value })} />
              </div>
            </div>
          </>
        )}

        {/* PREFERENCES */}
        {tab === "Preferences" && (
          <>
            <h2 className="mb-5 text-lg font-semibold">Preferences</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Language", "English"],
                ["Currency", "Indian Rupee (₹)"],
                ["Date format", "DD / MM / YYYY"],
              ].map(([label, value]) => (
                <label key={label}>
                  <span className="mb-1.5 block text-sm font-medium">{label}</span>
                  <button className="flex w-full items-center justify-between rounded-2xl border border-[#d8d0c8] px-3.5 py-2.5 text-sm">
                    {value}<ChevronDown size={16} />
                  </button>
                </label>
              ))}
            </div>
          </>
        )}

        {/* NOTIFICATIONS */}
        {tab === "Notifications" && (
          <div className="space-y-4">
            <h2 className="mb-5 text-lg font-semibold">Notification channels</h2>
            <Row title="WhatsApp reminders" text="Send reminders through WhatsApp Business" name="whatsapp" />
            <Row title="SMS reminders" text="Fallback to SMS when WhatsApp is not read" name="sms" />
            <Row title="Email reminders" text="Send professional email summaries" name="email" />
            <Row title="Payment received alerts" text="Instant toast when a payment comes in" name="payment" />
          </div>
        )}

        {/* AUTOMATION */}
        {tab === "Automation" && (
          <div className="space-y-4">
            <h2 className="mb-5 text-lg font-semibold">Smart reminder settings</h2>
            <Row title="AI-optimised reminder time" text="Send reminders when each customer is most likely to pay" name="ai" />
            <Row title="Auto-escalate overdue customers" text="Move to urgent tone after 15 days" name="escalate" />
            <Row title="Stop on payment received" text="Automatically end the workflow when payment is recorded" name="stop" />
          </div>
        )}

        {/* SECURITY */}
        {tab === "Security" && (
          <>
            <h2 className="mb-5 text-lg font-semibold">Security</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Current password" type="password" value={security.current}
                onChange={e => setSecurity({ ...security, current: e.target.value })} />
              <Input label="New password" type="password" value={security.password}
                onChange={e => setSecurity({ ...security, password: e.target.value })} />
            </div>

            <div className="mt-4 rounded-[20px] border border-[#ddd5cc] p-4">
              <h3 className="font-semibold">Two-factor authentication</h3>
              <p className="mt-1 text-xs text-[#77706b]">
                Secure your account with OTP on login.
              </p>
              <button
                onClick={() => {
                  setSecurity({ ...security, twoFA: !security.twoFA });
                  notify?.(security.twoFA ? "2FA disabled" : "2FA enabled");
                }}
                className={`mt-3 rounded-xl px-4 py-2 text-sm font-medium ${
                  security.twoFA
                    ? "bg-green-100 text-green-700"
                    : "border border-[#d8d0c8] hover:bg-[#f8f6f3]"
                }`}
              >
                {security.twoFA ? "✓ 2FA Enabled" : "Enable 2FA"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Save */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          className="flex items-center gap-2 rounded-xl bg-[#70212b] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#70212b]/15 transition hover:bg-[#581821] active:scale-95"
        >
          <Save size={16} /> Save changes
        </button>
      </div>
    </div>
  );
}