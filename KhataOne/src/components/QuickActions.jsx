import { Link2, Mic, Plus, ScanLine, Send, UserRoundPlus } from 'lucide-react'

export default function QuickActions({ onAction }) {
  const actions = [['customer', UserRoundPlus, 'Add Customer'], ['transaction', Plus, 'Add Transaction'], ['voice', Mic, 'Voice Entry'], ['scan', ScanLine, 'Scan Bill'], ['reminder', Send, 'Send Reminder'], ['link', Link2, 'Payment Link']]
  return <section className="rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]"><h2 className="font-serif text-xl font-bold">Quick actions</h2><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{actions.map(([id, Icon, label]) => <button className="flex flex-col items-center gap-2 rounded-lg border border-[#ebe7e3] p-3 text-[11px] text-[#8b8383] transition hover:border-[#8f2039] hover:text-[#8f2039] dark:border-[#423238]" key={id} onClick={() => onAction(id)}><Icon size={16} /><span>{label}</span></button>)}</div></section>
}
