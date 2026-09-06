import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import MoneyStuckCard from '../components/MoneyStuckCard.jsx'
import BusinessHealth from '../components/BusinessHealth.jsx'
import AIInsights from '../components/AIInsights.jsx'
import CashFlowChart from '../components/CashFlowChart.jsx'
import QuickActions from '../components/QuickActions.jsx'
import { money } from '../utils/calculations.js'

export default function Overview() {
	const { data, customers, totals } = useApp()
	const navigate = useNavigate()
	const [workflow, setWorkflow] = useState('')
	const currencyMoney = (value) => money(value, data.business.currency)
	const attention = customers.filter((item) => item.outstanding).sort((a, b) => a.score - b.score)
	const pending = customers.reduce((sum, item) => sum + item.outstanding, 0)
	const payable = data.transactions.filter((item) => item.type === 'payable' || item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0)
	const todayCollected = data.transactions.filter((item) => item.type === 'payment' && new Date(item.date).toDateString() === new Date().toDateString()).reduce((sum, item) => sum + Number(item.amount), 0)
	const groups = [
		{ label: 'Critical (30+ days)', amount: attention.filter((item) => item.overdue.length && item.score < 50).reduce((sum, item) => sum + item.outstanding, 0) },
		{ label: 'High priority (15–30 days)', amount: attention.filter((item) => item.overdue.length && item.score >= 50).reduce((sum, item) => sum + item.outstanding, 0) },
		{ label: 'Due soon', amount: attention.filter((item) => !item.overdue.length).reduce((sum, item) => sum + item.outstanding, 0) },
		{ label: 'Recently added', amount: 0 },
	]
	const openAction = (action) => {
		if (action === 'customer') navigate('/customers')
		else if (action === 'transaction') navigate('/transactions')
		else if (action === 'reminder') navigate('/collections')
		else setWorkflow(action)
	}
	return <div className="reference-dashboard">
		<section className="reference-hero"><div><h1>Good evening, {data.profile.name.split(' ')[0]}</h1><p>Here is where your money is stuck today — and how to recover it.</p></div><button className="primary-action" onClick={() => navigate('/collections')}>Recover money <span>→</span></button></section>
		<section className="reference-stat-grid">
			<StatCard label="Total receivable" value={currencyMoney(totals.receivable)} detail="12.4% vs last month" trend="up" type="receivable" />
			<StatCard label="Total payable" value={currencyMoney(payable)} detail="to your suppliers" type="payable" tone="blue" />
			<StatCard label="Overdue amount" value={currencyMoney(totals.overdue)} detail="18% needs action" trend="down" type="overdue" tone="red" />
			<StatCard label="Collected this month" value={currencyMoney(totals.collected)} detail={`Today ${currencyMoney(todayCollected)}`} type="collected" tone="green" />
		</section>
		<section className="reference-analysis-grid"><MoneyStuckCard groups={groups} total={pending} money={currencyMoney} onRemind={() => navigate('/collections')} /><BusinessHealth health={totals.health} /></section>
		<AIInsights risky={attention.filter((item) => item.score < 75).slice(0, 3)} likely={attention.filter((item) => item.score >= 75).slice(0, 3)} money={currencyMoney} />
		<section className="reference-bottom-grid"><CashFlowChart transactions={data.transactions} /><QuickActions onAction={openAction} /></section>
		{workflow && <Modal title={workflow === 'voice' ? 'Voice entry' : workflow === 'scan' ? 'Scan bill' : 'Payment link'} close={() => setWorkflow('')}><div className="workflow-modal"><p>{workflow === 'voice' ? 'Voice entry is ready for your next transaction.' : workflow === 'scan' ? 'Bill scanner is ready to capture a new expense.' : 'Payment link generation is ready for a customer.'}</p><button className="primary-action" onClick={() => setWorkflow('')}>Continue</button></div></Modal>}
	</div>
}