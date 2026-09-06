import { HeartPulse } from "lucide-react";

export default function BusinessHealth({ health }) {
  const metrics = [
    ["Cash flow", 80],
    ["Collections", 92],
    ["Customer risk", 58],
    ["Pending amount", 74],
  ];
  return (
    <section className="rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">Business health</h2>
        <HeartPulse size={17} className="text-[#8f2039]" />
      </div>
      <div
        className="mx-auto my-5 grid size-32 place-items-center rounded-full bg-[#e7f2eb]"
        style={{
          background: `conic-gradient(#6d9d7c ${health * 3.6}deg, #ece9e6 0deg)`,
        }}
      >
        <div className="grid size-24 place-items-center rounded-full bg-white dark:bg-[#2b2226]">
          <strong className="text-2xl">{health}</strong>
          <span className="text-xs text-[#8b8383]">/ 100</span>
        </div>
      </div>
      <strong className="block text-center text-[#468264]">Healthy</strong>
      <div className="mt-5 space-y-3">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{label}</span>
              <small className="text-[#8b8383]">{value}%</small>
            </div>
            <i className="block h-1.5 rounded-full bg-[#ece9e6]">
              <b
                className="block h-full rounded-full bg-[#6d9d7c]"
                style={{ width: `${value}%` }}
              />
            </i>
          </div>
        ))}
      </div>
    </section>
  );
}
