import { useApp } from "../context/AppContext.jsx";
import { Heading } from "../components/PageParts.jsx";
export default function Team() {
  const { data, update, notify } = useApp();
  const invite = () => {
    const email = window.prompt("Team member email");
    if (email) {
      update({
        team: [
          ...data.team,
          {
            id: crypto.randomUUID(),
            name: email.split("@")[0],
            email,
            role: "Cashier",
            status: "Invited",
          },
        ],
      });
      notify("Invitation saved");
    }
  };
  return (
    <Heading
      eyebrow="PEOPLE & PERMISSIONS"
      title="Team"
      action="Invite member"
      onAction={invite}
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
    </Heading>
  );
}
