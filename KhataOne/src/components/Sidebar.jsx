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
      onClose?.();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const name = data?.profile?.name || "Samir Kulkarni";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[246px] flex-col overflow-hidden bg-[#58151d] text-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="shrink-0 px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f1eb] font-serif text-[15px] font-bold text-[#65182b] shadow-sm">
              K1
            </div>

            <div>
              <strong className="block text-[20px] font-bold leading-tight tracking-tight">
                KhataOne
              </strong>

              <span className="mt-0.5 block text-[10px] text-[#d9b9bd]">
                Recover it smarter
              </span>
            </div>
          </div>
        </div>

        {/* Navigation - NO SCROLL */}
        <nav className="flex flex-1 flex-col justify-center gap-0.5 px-3">
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

        {/* Bottom User Section */}
        <div className="shrink-0 px-4 pb-4">
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f5eee7] text-[11px] font-bold text-[#65182b]">
                {initials}
              </div>

              <div className="min-w-0">
                <strong className="block truncate text-xs font-semibold text-white">
                  {name}
                </strong>

                <span className="mt-0.5 block text-[10px] text-[#cda5aa]">
                  Owner account
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] font-medium text-[#f2d6d9] transition-all hover:bg-[#8c2632] hover:text-white active:scale-[0.98]"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
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
        `group flex w-full items-center gap-3 rounded-xl px-3 py-[9px] text-[13px] transition-all duration-200 ${
          isActive
            ? "bg-[#76242e] font-semibold text-white shadow-lg shadow-black/10"
            : "text-[#e2c9cc] hover:bg-white/[0.07] hover:text-white"
        }`
      }
    >
      <Icon
        size={17}
        strokeWidth={1.8}
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      />

      <span className="truncate">{label}</span>
    </NavLink>
  );
}