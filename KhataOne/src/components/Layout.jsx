import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import AIChatbot from "./AIChatbot.jsx";
import { useApp } from "../context/AppContext.jsx";

export default function Layout() {
  const { toast } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f6f3] text-[#2b2528] transition-colors duration-300 dark:bg-[#211b1e] dark:text-[#f5eeee]">
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 lg:pl-[246px]">
        <Header onMenu={() => setSidebarOpen(true)} />

        <div className="mx-auto max-w-[1390px] px-4 py-7 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>

      {/* AI - All Pages */}
      <AIChatbot />

      {toast && (
        <div className="fixed bottom-5 left-5 z-[10000] flex items-center gap-2 rounded-lg bg-[#2b2528] px-4 py-3 text-sm text-white shadow-xl">
          <span>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}