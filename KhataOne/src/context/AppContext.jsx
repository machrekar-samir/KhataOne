import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { customerStats, metrics, money } from "../utils/calculations.js";
import { loadWorkspace, saveWorkspace } from "../services/storageService.js";

import {
  addCustomer,
  updateCustomer,
  deleteCustomer as deleteCustomerFromFirestore,
  subscribeToCustomers,
} from "../services/customerService.js";

import {
  removeTransaction,
  saveTransaction,
} from "../services/transactionService.js";

import { auth } from "../config/firebase.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace);
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Listen for logged-in Firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Real-time Firestore customer sync
  useEffect(() => {
    if (!user?.uid) {
      setLoadingCustomers(false);
      return;
    }

    setLoadingCustomers(true);

    const unsubscribe = subscribeToCustomers(
      user.uid,
      (firebaseCustomers) => {
        setData((current) => ({
          ...current,
          customers: firebaseCustomers,
        }));

        setLoadingCustomers(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  // Save other workspace data locally
  useEffect(() => {
    saveWorkspace(data);
  }, [data]);

  // Customers with calculated stats
  const customers = useMemo(
    () =>
      data.customers.map((item) =>
        customerStats(item, data.transactions),
      ),
    [data.customers, data.transactions],
  );

  // Dashboard totals
  const totals = useMemo(
    () => metrics(data.transactions, range),
    [data.transactions, range],
  );

  // General update helper
  const update = (changes) =>
    setData((current) => ({
      ...current,
      ...changes,
    }));

  // Toast notification
  const notify = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2400);
  };

  // Activity logger
  const activity = (title, detail = "") => {
    setData((current) => ({
      ...current,
      activities: [
        {
          id: crypto.randomUUID(),
          title,
          detail,
          date: new Date().toISOString(),
        },
        ...current.activities,
      ].slice(0, 30),
    }));
  };

  // =========================
  // CUSTOMER - FIRESTORE
  // =========================

  const saveCustomer = async (value) => {
    if (!user?.uid) {
      notify("Please login first");
      return;
    }

    try {
      const exists = Boolean(value.id);

      if (exists) {
        await updateCustomer(user.uid, value);
      } else {
        await addCustomer(user.uid, value);
      }

      activity(
        exists ? "Customer updated" : "Customer added",
        value.name,
      );

      notify(exists ? "Customer updated" : "Customer saved");
    } catch (error) {
      console.error("Customer save error:", error);
      notify("Failed to save customer");
    }
  };

  // =========================
  // TRANSACTIONS
  // Currently Local Storage
  // =========================

  const saveTxn = (value) => {
    const exists = data.transactions.some(
      (item) => item.id === value.id,
    );

    update({
      transactions: saveTransaction(
        data.transactions,
        value,
      ),
    });

    activity(
      value.type === "payment"
        ? "Payment received"
        : exists
          ? "Transaction edited"
          : "Transaction created",
      money(
        value.amount,
        data.business.currency,
      ),
    );

    notify("Transaction saved");
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const deleteCustomer = async (id) => {
    if (!user?.uid) {
      notify("Please login first");
      return;
    }

    try {
      const item = data.customers.find(
        (customer) => customer.id === id,
      );

      await deleteCustomerFromFirestore(
        user.uid,
        id,
      );

      // Remove related local transactions
      setData((current) => ({
        ...current,
        transactions: current.transactions.filter(
          (transaction) =>
            transaction.customerId !== id,
        ),
      }));

      activity(
        "Customer deleted",
        item?.name || "",
      );

      notify("Customer deleted");
    } catch (error) {
      console.error(
        "Customer delete error:",
        error,
      );

      notify("Failed to delete customer");
    }
  };

  // =========================
  // DELETE TRANSACTION
  // =========================

  const deleteTxn = (id) => {
    update({
      transactions: removeTransaction(
        data.transactions,
        id,
      ),
    });

    notify("Transaction deleted");
  };

  // =========================
  // REMINDER
  // =========================

  const reminder = (customer) => {
    setData((current) => ({
      ...current,

      reminders: [
        {
          id: crypto.randomUUID(),
          customerId: customer.id,
          amount: customer.outstanding,
          type: "Friendly",
          channel: "WhatsApp",
          status: "Demo queued",
          date: new Date().toISOString(),
        },
        ...current.reminders,
      ],

      notifications: [
        {
          id: crypto.randomUUID(),
          text: `Reminder queued for ${customer.name}`,
          read: false,
        },
        ...current.notifications,
      ],
    }));

    activity(
      "Reminder sent",
      `${customer.name} via WhatsApp`,
    );

    notify("Reminder queued in demo mode");
  };

  return (
    <AppContext.Provider
      value={{
        data,
        customers,
        totals,
        range,
        setRange,
        toast,
        user,
        loadingCustomers,
        update,
        notify,
        activity,
        saveCustomer,
        saveTxn,
        deleteCustomer,
        deleteTxn,
        reminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);