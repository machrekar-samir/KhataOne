import { BellRing } from 'lucide-react'

export default function MoneyStuckCard({ groups, total, onRemind, money }) {
  return <section className="rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]">
    <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="font-serif text-xl font-bold">Money stuck intelligence</h2><p className="mt-1 text-xs text-[#8b8383]">{money(total)} total pending, split by urgency</p></div><button className="flex items-center gap-1 self-start rounded-lg border border-[#ebe7e3] px-3 py-2 text-xs font-bold text-[#8f2039] dark:border-[#423238]" onClick={onRemind}><BellRing size={14} /> Send smart reminders</button></div>
    <div className="my-5 flex h-2 overflow-hidden rounded-full">{groups.map((group, index) => <span className={['bg-[#ae3b52]', 'bg-[#d98573]', 'bg-[#e5bc59]', 'bg-[#81ac7e]'][index]} style={{ flexGrow: Math.max(group.amount, 1) }} key={group.label} />)}</div>
    <div className="grid gap-3 sm:grid-cols-2">{groups.map((group, index) => <div className="flex items-center gap-2 text-xs" key={group.label}><span className={['bg-[#ae3b52]', 'bg-[#d98573]', 'bg-[#e5bc59]', 'bg-[#81ac7e]'][index] + ' size-2 rounded-full'} /><span className="flex-1 text-[#8b8383]">{group.label}</span><strong>{money(group.amount)}</strong></div>)}</div>
  </section>
}
