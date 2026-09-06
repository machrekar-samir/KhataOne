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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col bg-[#58151d] px-4 py-5 text-white transition-transform duration-300 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-1">
          <span className="grid size-9 place-items-center rounded-full bg-[#f5eee7] font-serif text-sm font-bold text-[#65182b]">
            K1
          </span>

          <div>
            <strong className="block text-[18px] font-bold tracking-tight text-white">
              KhataOne
            </strong>
            <small className="block text-[10px] text-[#d5aeb2]">
              Recover it smarter
            </small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-7 flex flex-col gap-1">
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

        {/* AI Card */}
        <div className="mt-auto">
          <div className="rounded-2xl border border-white/5 bg-[#6a2029] p-4">
            <strong className="block text-sm font-bold text-white">
              KhataOne AI
            </strong>

            <p className="mt-1.5 text-[11px] leading-relaxed text-[#e1bec2]">
              Ask anything about your pending money.
            </p>

            <NavLink
              className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#f5eee7] px-3 py-2 text-[11px] font-bold text-[#6a2029] transition hover:bg-white"
              to="/ai-insights"
              onClick={onClose}
            >
              Open assistant
            </NavLink>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 px-2 pt-5">
            <div className="grid size-8 place-items-center rounded-full bg-[#f5eee7] text-[10px] font-bold text-[#65182b]">
              {data.profile.name?.slice(0, 2).toUpperCase() || "SM"}
            </div>

            <div className="min-w-0">
              <strong className="block truncate text-xs text-white">
                {data.profile.name}
              </strong>

              <small className="block text-[10px] text-[#cda5aa]">
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
      to={path}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 ${
          isActive
            ? "bg-[#76242e] font-semibold text-white shadow-sm"
            : "text-[#e1c7ca] hover:bg-[#6a2029] hover:text-white"
        }`
      }
    >
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  );
}