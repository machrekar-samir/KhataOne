import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useApp } from "../context/AppContext.jsx";
import {
  Bell,
  Moon,
  Search,
  Sun,
  Menu,
  X,
  UserRound,
} from "lucide-react";

export default function Header({ onMenu }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { customers = [] } = useApp();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return customers.slice(0, 4);

    return customers
      .filter((customer) =>
        `${customer.name || ""} ${customer.phone || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
      .slice(0, 5);
  }, [query, customers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate("/customers");
      setOpen(false);
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="relative z-40 flex h-[60px] items-center gap-2 border-b border-[#ebe7e3] bg-white/90 px-3 backdrop-blur transition-colors duration-300 sm:h-[76px] sm:gap-4 sm:px-6 lg:px-10 dark:border-[#423238] dark:bg-[#281f23]/90">

      {/* Mobile Menu */}
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="flex shrink-0 items-center justify-center text-[#8f2039] lg:hidden"
      >
        <Menu size={19} />
      </button>

      {/* Search */}
      <div
        ref={searchRef}
        className="relative min-w-0 flex-1 lg:max-w-[440px]"
      >
        <div
          className={`flex h-10 w-full items-center gap-2 rounded-xl border bg-white px-3 transition-all dark:bg-[#2d2428] ${
            open
              ? "border-[#8f2039] shadow-md"
              : "border-[#ebe7e3] dark:border-[#423238]"
          }`}
        >
          <Search
            size={16}
            className="shrink-0 text-[#8b8383] dark:text-[#bbaeb1]"
          />

          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="min-w-0 flex-1 bg-transparent text-xs text-[#332d2f] outline-none placeholder:text-[#a69c9c] sm:text-sm dark:text-white"
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                setOpen(false);
              }}
              className="shrink-0 text-[#8b8383]"
            >
              <X size={15} />
            </button>
          )}

          <kbd className="hidden shrink-0 rounded-md border border-[#ebe7e3] px-1.5 py-0.5 text-[9px] text-[#8b8383] sm:block dark:border-[#423238]">
            ⌘ K
          </kbd>
        </div>

        {/* Search Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#ebe7e3] bg-white shadow-xl dark:border-[#423238] dark:bg-[#2d2428]">

            {results.length > 0 ? (
              <>
                <div className="border-b border-[#f0ece8] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#a69c9c] dark:border-[#423238]">
                  Customers
                </div>

                {results.map((customer, index) => (
                  <button
                    key={customer.id || index}
                    onClick={() => {
                      navigate(`/customers/${customer.id}`);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-[#f8f4f1] dark:hover:bg-[#382c31]"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f4e5e7] text-[#8f2039] dark:bg-[#4a2932]">
                      <UserRound size={14} />
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-[#332d2f] dark:text-white">
                        {customer.name || "Customer"}
                      </span>

                      <span className="block truncate text-[10px] text-[#8b8383]">
                        {customer.phone || "No phone number"}
                      </span>
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    navigate("/customers");
                    setOpen(false);
                  }}
                  className="w-full border-t border-[#f0ece8] px-3 py-3 text-left text-xs font-semibold text-[#8f2039] hover:bg-[#f8f4f1] dark:border-[#423238] dark:hover:bg-[#382c31]"
                >
                  View all customers →
                </button>
              </>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-[#8b8383]">
                No customers found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">

        {/* Theme */}
        <button
          className="relative grid size-7 place-items-center text-[#8b8383] transition hover:text-[#8f2039] dark:text-[#bbaeb1]"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification */}
        <button
          className="relative grid size-7 place-items-center text-[#8b8383] transition hover:text-[#8f2039] dark:text-[#bbaeb1]"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={18} />

          <span className="absolute right-0 top-0 grid min-w-[14px] h-[14px] place-items-center rounded-full bg-[#8f2039] px-1 text-[8px] font-bold text-white">
            3
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/settings")}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-[#7b2335] text-[10px] font-bold text-white sm:size-9"
        >
          SM
        </button>
      </div>
    </header>
  );
}