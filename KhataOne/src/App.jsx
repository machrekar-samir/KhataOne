import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Layout from "./components/Layout.jsx";

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

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* App Routes */}
            <Route element={<Layout />}>
              <Route path="/overview" element={<Overview />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />

              <Route path="/transactions" element={<Transactions />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route
                path="/payment-calendar"
                element={<PaymentCalendar />}
              />
              <Route path="/reports" element={<Reports />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/team" element={<Team />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default */}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}