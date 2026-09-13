import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useAuth } from "./context/useAuth.js";

import Layout from "./components/Layout.jsx";

import Welcome from "./pages/Welcome.jsx";
import Overview from "./pages/Overview.jsx";
import Customers from "./pages/Customers.jsx";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import CustomerForm from "./pages/CustomerForm.jsx";
import Transactions from "./pages/Transactions.jsx";
import Collections from "./pages/Collections.jsx";
import AIInsights from "./pages/AIInsights.jsx";
import PaymentCalendar from "./pages/PaymentCalendar.jsx";
import Reports from "./pages/Reports.jsx";
import Team from "./pages/Team.jsx";
import Automation from "./pages/Automation.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f3]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-[#7b1825] border-t-transparent" />
          <p className="text-sm text-[#667085]">
            Loading KhataOne...
          </p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcf7f2]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#7b2633] border-t-transparent" />
      </div>
    );
  }

  return user ? (
    <Navigate to="/overview" replace />
  ) : (
    children
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Routes>

          {/* WEBSITE OPEN → WELCOME */}
          <Route
            path="/"
            element={<Welcome />}
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* SIGN UP */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* PROTECTED APP */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/overview" element={<Overview />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/payment-calendar" element={<PaymentCalendar />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/team" element={<Team />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* WRONG URL → WELCOME */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
}