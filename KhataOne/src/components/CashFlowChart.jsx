export default function CashFlowChart({ transactions }) {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const payments = transactions.filter((item) => item.type === 'payment').reduce((sum, item) => sum + Number(item.amount), 0)
  const points = months.map((_, index) => `${index * 20},${112 - Math.min(88, Math.max(8, payments / 900 * (index + 1)))}`).join(' ')
  return <section className="reference-panel chart-panel"><h2>Cash flow trend</h2><div className="chart-wrap"><div className="chart-y"><span>80k</span><span>60k</span><span>40k</span><span>20k</span><span>0k</span></div><svg viewBox="0 0 100 120" preserveAspectRatio="none" role="img" aria-label="Cash flow trend"><path className="chart-line" d={`M ${points}`} /><path className="chart-area" d={`M 0 120 L ${points} L 100 120 Z`} /></svg><div className="chart-x">{months.map((month) => <span key={month}>{month}</span>)}</div></div></section>
}
