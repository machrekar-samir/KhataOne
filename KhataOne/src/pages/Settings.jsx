import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { Heading } from "../components/PageParts.jsx";
export default function Settings() {
  const { data, update, notify } = useApp();
  const [business, setBusiness] = useState(data.business);
  const field = (label, key, area = false) => (
    <label className="space-y-1 text-xs font-bold text-[#8b8383]">
      {label}
      {area ? (
        <textarea
          className="min-h-24 w-full rounded-lg border border-[#ebe7e3] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#8f2039] dark:border-[#423238] dark:bg-[#2b2226]"
          value={business[key]}
          onChange={(event) =>
            setBusiness({ ...business, [key]: event.target.value })
          }
        />
      ) : (
        <input
          className="w-full rounded-lg border border-[#ebe7e3] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#8f2039] dark:border-[#423238] dark:bg-[#2b2226]"
          value={business[key]}
          onChange={(event) =>
            setBusiness({ ...business, [key]: event.target.value })
          }
        />
      )}
    </label>
  );
  return (
    <Heading eyebrow="WORKSPACE CONTROL" title="Settings">
      <form
        className="grid max-w-3xl gap-4 rounded-xl border border-[#ebe7e3] bg-white p-5 dark:border-[#423238] dark:bg-[#2b2226] sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          update({ business });
          notify("Business settings saved");
        }}
      >
        {field("Business name", "name")}
        {field("Business type", "type")}
        {field("Phone", "phone")}
        {field("Email", "email")}
        {
          <div className="sm:col-span-2">
            {field("Address", "address", true)}
          </div>
        }
        <button className="rounded-lg bg-[#8f2039] px-3.5 py-2.5 text-xs font-bold text-white sm:col-span-2 sm:w-fit">
          Save settings
        </button>
      </form>
    </Heading>
  );
}
