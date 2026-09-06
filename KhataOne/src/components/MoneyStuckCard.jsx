import { BellRing } from 'lucide-react'

export default function MoneyStuckCard({ groups, total, onRemind, money }) {
  const colors = ['critical', 'priority', 'soon', 'recent']
  return <section className="reference-panel money-stuck-panel">
    <div className="reference-panel-head"><div><h2>Money stuck intelligence</h2><p>{money(total)} total pending, split by urgency</p></div><button className="outline-action" onClick={onRemind}><BellRing size={14} /> Send smart reminders</button></div>
    <div className="urgency-bar">{groups.map((group, index) => <span className={colors[index]} style={{ flexGrow: Math.max(group.amount, 1) }} key={group.label} />)}</div>
    <div className="urgency-grid">{groups.map((group, index) => <div className="urgency-item" key={group.label}><span className={`status-dot ${colors[index]}`} /><span>{group.label}</span><strong>{money(group.amount)}</strong></div>)}</div>
  </section>
}
