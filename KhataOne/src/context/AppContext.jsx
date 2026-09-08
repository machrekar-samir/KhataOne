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
  addTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionFromFirestore,
  subscribeToTransactions,
} from "../services/transactionService.js";

import { auth } from "../config/firebase.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace);
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // =========================
  // AUTH USER
  // =========================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // =========================
  // FIRESTORE CUSTOMERS
  // =========================
  useEffect(() => {
    if (!user?.uid) {
      setData((current) => ({
        ...current,
        customers: [],
      }));
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

  // =========================
  // FIRESTORE TRANSACTIONS
  // =========================
  useEffect(() => {
    if (!user?.uid) {
      setData((current) => ({
        ...current,
        transactions: [],
      }));
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);

    const unsubscribe = subscribeToTransactions(
      user.uid,
      (firebaseTransactions) => {
        setData((current) => ({
          ...current,
          transactions: firebaseTransactions,
        }));

        setLoadingTransactions(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  // =========================
  // LOCAL STORAGE
  // Other UI data backup
  // =========================
  useEffect(() => {
    saveWorkspace(data);
  }, [data]);

  // =========================
  // CUSTOMERS WITH STATS
  // =========================
  const customers = useMemo(
    () =>
      data.customers.map((item) =>
        customerStats(item, data.transactions),
      ),
    [data.customers, data.transactions],
  );

  // =========================
  // DASHBOARD TOTALS
  // =========================
  const totals = useMemo(
    () => metrics(data.transactions, range),
    [data.transactions, range],
  );

  // =========================
  // GENERAL UPDATE
  // =========================
  const update = (changes) =>
    setData((current) => ({
      ...current,
      ...changes,
    }));

  // =========================
  // TOAST
  // =========================
  const notify = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2400);
  };

  // =========================
  // ACTIVITY
  // =========================
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
  // SAVE CUSTOMER
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
  // SAVE TRANSACTION
  // =========================
  const saveTxn = async (value) => {
    if (!user?.uid) {
      notify("Please login first");
      return;
    }

    try {
      const exists = Boolean(value.id);

      if (exists) {
        await updateTransaction(user.uid, value);
      } else {
        await addTransaction(user.uid, value);
      }

      activity(
        value.type === "payment"
          ? "Payment received"
          : exists
            ? "Transaction updated"
            : "Transaction created",
        money(
          Number(value.amount || 0),
          data.business?.currency || "INR",
        ),
      );

      notify(
        exists
          ? "Transaction updated"
          : "Transaction saved",
      );
    } catch (error) {
      console.error("Transaction save error:", error);
      notify("Failed to save transaction");
    }
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
  const deleteTxn = async (id) => {
    if (!user?.uid) {
      notify("Please login first");
      return;
    }

    try {
      await deleteTransactionFromFirestore(
        user.uid,
        id,
      );

      activity("Transaction deleted");

      notify("Transaction deleted");
    } catch (error) {
      console.error(
        "Transaction delete error:",
        error,
      );

      notify("Failed to delete transaction");
    }
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
        loadingTransactions,
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