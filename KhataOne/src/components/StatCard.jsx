import { ArrowDownRight, ArrowUpRight, CircleAlert, CircleCheck, WalletCards } from 'lucide-react'

const icons = { receivable: WalletCards, payable: WalletCards, overdue: CircleAlert, collected: CircleCheck }

export default function StatCard({ label, value, detail, tone = 'burgundy', trend, type }) {
  const Icon = icons[type] || WalletCards
  return <article className="reference-stat-card">
    <div className={`reference-stat-icon ${tone}`}><Icon size={16} strokeWidth={1.8} /></div>
    <span className="reference-label">{label}</span>
    <strong className="reference-stat-value">{value}</strong>
    <span className={`reference-stat-detail ${tone === 'green' ? 'green' : tone === 'red' ? 'red' : ''}`}>
      {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}{detail}
    </span>
  </article>
}
