import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import { useApp } from '../context/AppContext.jsx'
export default function Layout() { const { dark, toast } = useApp(); return <div className={dark ? 'app dark' : 'app'}><Sidebar /><main className="content"><Header /><div className="page-content"><Outlet /></div></main>{toast && <div className="toast"><span>✓</span>{toast}</div>}</div> }