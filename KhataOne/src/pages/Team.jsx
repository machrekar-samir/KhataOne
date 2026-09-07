import { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { Heading } from "../components/PageParts.jsx";
export default function Team() {
  const { data, update, notify } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const invite = () => {
    if (email.trim()) {
      update({
        team: [
          ...data.team,
          {
            id: crypto.randomUUID(),
            name: email.trim().split("@")[0],
            email: email.trim(),
            role: "Cashier",
            status: "Invited",
          },
        ],
      });
      notify("Invitation saved");
      setEmail("");
      setInviteOpen(false);
    }
  };
  return (
    <Heading
      eyebrow="PEOPLE & PERMISSIONS"
      title="Team"
      action="Invite member"
      onAction={() => setInviteOpen(true)}
    >
      <div className="overflow-hidden rounded-xl border border-[#ebe7e3] bg-white dark:border-[#423238] dark:bg-[#2b2226]">
        {data.team.map((member) => (
          <div
            className="flex flex-col gap-3 border-b border-[#ebe7e3] p-4 last:border-0 sm:flex-row sm:items-center dark:border-[#423238]"
            key={member.id}
          >
            <div className="flex-1">
              <strong className="block text-sm">{member.name}</strong>
              <small className="text-xs text-[#8b8383]">
                {member.email} · {member.status}
              </small>
            </div>
            <select
              className="rounded-lg border border-[#ebe7e3] bg-transparent px-3 py-2 text-xs dark:border-[#423238]"
              value={member.role}
              onChange={(event) =>
                update({
                  team: data.team.map((item) =>
                    item.id === member.id
                      ? { ...item, role: event.target.value }
                      : item,
                  ),
                })
              }
            >
              <option>Owner</option>
              <option>Manager</option>
              <option>Cashier</option>
              <option>Accountant</option>
            </select>
          </div>
        ))}
      </div>
      {inviteOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setInviteOpen(false)}
        >
          <form
            className="w-full max-w-md rounded-2xl border border-[#ebe7e3] bg-white p-6 shadow-2xl dark:border-[#423238] dark:bg-[#2b2226]"
            onSubmit={(event) => {
              event.preventDefault();
              invite();
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Invite team member</h2>
                <p className="mt-1 text-sm text-[#8b8383]">Enter their email address to send an invitation.</p>
              </div>
              <button type="button" onClick={() => setInviteOpen(false)} aria-label="Close invite dialog" className="rounded-lg p-2 text-[#8b8383] hover:bg-[#f3eeee] dark:hover:bg-[#44373b]"><X size={18} /></button>
            </div>
            <input autoFocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" className="mt-5 w-full rounded-xl border border-[#ebe7e3] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#8f2039] dark:border-[#423238]" />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-xl border border-[#ebe7e3] px-4 py-2.5 text-sm font-semibold text-[#756d6d] dark:border-[#423238]">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#741f2c] px-4 py-2.5 text-sm font-semibold text-white">Send invite</button>
            </div>
          </form>
        </div>
      )}
    </Heading>
  );
}
