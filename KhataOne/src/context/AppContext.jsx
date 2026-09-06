import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { customerStats, metrics, money } from '../utils/calculations.js'
import { loadWorkspace, saveWorkspace } from '../services/storageService.js'
import { addCustomer, removeCustomer, updateCustomer } from '../services/customerService.js'
import { removeTransaction, saveTransaction } from '../services/transactionService.js'

const AppContext = createContext(null)
export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace); const [range, setRange] = useState('month'); const [dark, setDark] = useState(() => loadWorkspace().settings?.theme === 'dark'); const [toast, setToast] = useState('')
  useEffect(() => saveWorkspace(data), [data])
  const customers = useMemo(() => data.customers.map((item) => customerStats(item, data.transactions)), [data.customers, data.transactions]); const totals = useMemo(() => metrics(data.transactions, range), [data.transactions, range])
  const update = (changes) => setData((current) => ({ ...current, ...changes })); const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2400) }; const activity = (title, detail = '') => update({ activities: [{ id: crypto.randomUUID(), title, detail, date: new Date().toISOString() }, ...data.activities].slice(0, 30) })
  const saveCustomer = (value) => { const exists = data.customers.some((item) => item.id === value.id); update({ customers: exists ? updateCustomer(data.customers, value) : addCustomer(data.customers, value) }); activity(exists ? 'Customer updated' : 'Customer added', value.name); notify('Customer saved') }
  const saveTxn = (value) => { const exists = data.transactions.some((item) => item.id === value.id); update({ transactions: saveTransaction(data.transactions, value) }); activity(value.type === 'payment' ? 'Payment received' : exists ? 'Transaction edited' : 'Transaction created', money(value.amount, data.business.currency)); notify('Transaction saved') }
  const deleteCustomer = (id) => { const item = data.customers.find((customer) => customer.id === id); update({ customers: removeCustomer(data.customers, id), transactions: data.transactions.filter((transaction) => transaction.customerId !== id) }); activity('Customer deleted', item?.name); notify('Customer deleted') }
  const deleteTxn = (id) => { update({ transactions: removeTransaction(data.transactions, id) }); notify('Transaction deleted') }
  const reminder = (customer) => { update({ reminders: [{ id: crypto.randomUUID(), customerId: customer.id, amount: customer.outstanding, type: 'Friendly', channel: 'WhatsApp', status: 'Demo queued', date: new Date().toISOString() }, ...data.reminders], notifications: [{ id: crypto.randomUUID(), text: `Reminder queued for ${customer.name}`, read: false }, ...data.notifications] }); activity('Reminder sent', `${customer.name} via WhatsApp`); notify('Reminder queued in demo mode') }
  const toggleTheme = () => { const next = !dark; setDark(next); update({ settings: { ...data.settings, theme: next ? 'dark' : 'light' } }) }
  return <AppContext.Provider value={{ data, customers, totals, range, setRange, dark, toggleTheme, toast, update, notify, activity, saveCustomer, saveTxn, deleteCustomer, deleteTxn, reminder }}>{children}</AppContext.Provider>
}
// The hook stays next to its provider so feature modules share one public state API.
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)