import { Link2, Mic, Plus, ScanLine, Send, UserRoundPlus } from 'lucide-react'

export default function QuickActions({ onAction }) {
  const actions = [['customer', UserRoundPlus, 'Add Customer'], ['transaction', Plus, 'Add Transaction'], ['voice', Mic, 'Voice Entry'], ['scan', ScanLine, 'Scan Bill'], ['reminder', Send, 'Send Reminder'], ['link', Link2, 'Payment Link']]
  return <section className="reference-panel quick-actions-panel"><h2>Quick actions</h2><div className="quick-actions-grid">{actions.map(([id, Icon, label]) => <button key={id} onClick={() => onAction(id)}><Icon size={16} /><span>{label}</span></button>)}</div></section>
}
