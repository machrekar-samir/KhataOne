import { HeartPulse } from 'lucide-react'

export default function BusinessHealth({ health }) {
  const metrics = [['Cash flow', 80], ['Collections', 92], ['Customer risk', 58], ['Pending amount', 74]]
  return <section className="reference-panel health-panel"><div className="reference-panel-head"><h2>Business health</h2><HeartPulse size={17} /></div><div className="health-ring" style={{ '--health': `${health * 3.6}deg` }}><div><strong>{health}</strong><span>/ 100</span></div></div><strong className="health-status">Healthy</strong><div className="health-metrics">{metrics.map(([label, value]) => <div key={label}><div><span>{label}</span><small>{value}%</small></div><i><b style={{ width: `${value}%` }} /></i></div>)}</div></section>
}
