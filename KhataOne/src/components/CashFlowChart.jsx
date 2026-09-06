export default function CashFlowChart({ transactions }) {
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const payments = transactions.filter((item) => item.type === 'payment').reduce((sum, item) => sum + Number(item.amount), 0)
  const points = months.map((_, index) => `${index * 20},${112 - Math.min(88, Math.max(8, payments / 900 * (index + 1)))}`).join(' ')
  return <section className="rounded-xl border border-[#ebe7e3] bg-white p-5 shadow-sm dark:border-[#423238] dark:bg-[#2b2226]"><h2 className="font-serif text-xl font-bold">Cash flow trend</h2><div className="mt-4 h-48"><svg className="h-full w-full" viewBox="0 0 100 120" preserveAspectRatio="none" role="img" aria-label="Cash flow trend"><path className="fill-[#fbecef]" d={`M 0 120 L ${points} L 100 120 Z`} /><path className="fill-none stroke-[#8f2039]" strokeWidth="2" vectorEffect="non-scaling-stroke" d={`M ${points}`} /></svg><div className="flex justify-between text-[10px] text-[#8b8383]">{months.map((month) => <span key={month}>{month}</span>)}</div></div></section>
}
