import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase.js";
import {
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
  LogOut,
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("khataone_logged_in");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col bg-[#58151d] px-4 py-5 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-3 px-1">
          <span className="grid size-9 place-items-center rounded-full bg-[#f5eee7] font-serif text-sm font-bold text-[#65182b]">
            K1
          </span>

          <div>
            <strong className="block text-[18px] font-bold tracking-tight">
              KhataOne
            </strong>
            <small className="block text-[10px] text-[#d5aeb2]">
              Recover it smarter
            </small>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
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

        {/* User + Logout */}
        <div className="mt-3 shrink-0 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f5eee7] text-[11px] font-bold text-[#65182b]">
              {data?.profile?.name?.slice(0, 2).toUpperCase() || "SM"}
            </div>

            <div className="min-w-0">
              <strong className="block truncate text-xs text-white">
                {data?.profile?.name || "User"}
              </strong>

              <small className="block text-[10px] text-[#cda5aa]">
                Owner account
              </small>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-[#f3c4c8] transition hover:bg-[#8c2632] hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ label, path, Icon, onClick }) {
  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 ${
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