import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  Bot,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Cog,
  LayoutDashboard,
  Network,
  Receipt,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
const items = [
  ["Dashboard", "/overview", LayoutDashboard],
  ["Customers", "/customers", UsersRound],
  ["Transactions", "/transactions", Receipt],
  ["Collections", "/collections", WalletCards],
  ["AI Insights", "/ai-insights", Sparkles],
  ["Payment Calendar", "/payment-calendar", CalendarDays],
  ["Automation", "/automation", Network],
  ["Reports", "/reports", ChartNoAxesCombined],
  ["Team", "/team", UsersRound],
  ["Notifications", "/notifications", Bell],
  ["Settings", "/settings", Cog],
];
export default function Sidebar({ isOpen, onClose }) {
  const { data } = useApp();
  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-[#ebe7e3] bg-white px-4 py-7 transition-transform dark:border-[#423238] dark:bg-[#291f23] lg:translate-x-0`}
      >
        <div className="flex items-center gap-2.5 px-3 text-[21px] font-bold tracking-[-.7px] text-[#65182b] dark:text-[#f2b9c5]">
          <span className="grid size-7 place-items-center rounded-[9px] bg-[#8f2039] font-serif text-lg text-white">
            K1
          </span>
          <div>
            <strong>KhataOne</strong>
            <small className="block text-[10px] font-normal text-[#bb5e72]">
              Recover it smarter
            </small>
          </div>
        </div>
        <nav className="mt-9 flex flex-col gap-1">
          {items.map(([label, path, Icon]) => (
            <NavItem
              key={path}
              label={label}
              path={path}
              Icon={Icon}
              onClick={onClose}
            />
          ))}
        </nav>
        <div className="mt-auto">
          <div className="rounded-[10px] bg-[#fbf1ed] p-4 dark:bg-[#402b2e]">
            <Bot size={17} className="text-[#8f2039]" />
            <strong className="mt-2 block text-xs">KhataOne AI</strong>
            <p className="my-1.5 text-[10px] leading-relaxed text-[#8b8383]">
              Ask anything about your pending money.
            </p>
            <NavLink
              className="text-[10px] font-bold text-[#8f2039]"
              to="/ai-insights"
              onClick={onClose}
            >
              Open assistant <span>→</span>
            </NavLink>
          </div>
          <div className="flex items-center gap-2.5 px-1.5 pt-6">
            <div className="grid size-7 place-items-center rounded-full bg-[#ddd1df] text-[10px] font-bold text-[#6a526c]">
              {data.profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong className="block text-xs">{data.profile.name}</strong>
              <small className="block text-[10px] text-[#8b8383]">
                Owner account
              </small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
function NavItem({ label, path, Icon, onClick }) {
  return (
    <NavLink
      onClick={onClick}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${isActive ? "bg-[#fbecef] font-bold text-[#8f2039] dark:bg-[#482832] dark:text-[#f3bdc8]" : "text-[#817779] hover:bg-[#fbf1f1] hover:text-[#8f2039] dark:text-[#bbaeb1]"}`
      }
      to={path}
    >
      <Icon size={15} strokeWidth={1.8} />
      {label}
    </NavLink>
  );
}
