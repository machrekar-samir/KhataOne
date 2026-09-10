import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import {
  customerStats,
  metrics,
  money,
} from "../utils/calculations.js";

import {
  loadWorkspace,
  saveWorkspace,
} from "../services/storageService.js";

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

import {
  createReminder,
  subscribeToReminders,
} from "../services/reminderService.js";

import { auth } from "../config/firebase.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace);
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);

  /* AUTH */
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  /* CUSTOMERS REALTIME */
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

  /* TRANSACTIONS REALTIME */
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

  /* REMINDERS REALTIME */
  useEffect(() => {
    if (!user?.uid) {
      setReminders([]);
      setLoadingReminders(false);
      return;
    }

    setLoadingReminders(true);

    const unsubscribe = subscribeToReminders(
      user.uid,
      (firebaseReminders) => {
        setReminders(firebaseReminders);
        setLoadingReminders(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  /* LOCAL BACKUP */
  useEffect(() => {
    saveWorkspace(data);
  }, [data]);

  /* CUSTOMER STATS */
  const customers = useMemo(
    () =>
      (data.customers || []).map((item) =>
        customerStats(
          item,
          data.transactions || [],
        ),
      ),
    [data.customers, data.transactions],
  );

  /* TOTALS */
  const totals = useMemo(
    () =>
      metrics(
        data.transactions || [],
        range,
      ),
    [data.transactions, range],
  );

  /* UPDATE */
  const update = (changes) => {
    setData((current) => ({
      ...current,
      ...changes,
    }));
  };

  /* TOAST */
  const notify = (message) => {
    setToast(message);

    window.setTimeout(
      () => setToast(""),
      2400,
    );
  };

  /* ACTIVITY */
  const activity = (
    title,
    detail = "",
  ) => {
    setData((current) => ({
      ...current,
      activities: [
        {
          id: crypto.randomUUID(),
          title,
          detail,
          date: new Date().toISOString(),
        },
        ...(current.activities || []),
      ].slice(0, 30),
    }));
  };

  /* SAVE CUSTOMER */
  const saveCustomer = async (value) => {
    if (!user?.uid) {
      notify("Please login first");
      return false;
    }

    try {
      const exists = Boolean(value.id);

      if (exists) {
        await updateCustomer(
          user.uid,
          value,
        );
      } else {
        await addCustomer(
          user.uid,
          value,
        );
      }

      activity(
        exists
          ? "Customer updated"
          : "Customer added",
        value.name,
      );

      notify(
        exists
          ? "Customer updated"
          : "Customer saved",
      );

      return true;
    } catch (error) {
      console.error(
        "Customer save error:",
        error,
      );

      notify(
        "Failed to save customer",
      );

      return false;
    }
  };

  /* SAVE TRANSACTION */
  const saveTxn = async (value) => {
    if (!user?.uid) {
      notify("Please login first");
      return false;
    }

    try {
      const exists = Boolean(value.id);

      if (exists) {
        await updateTransaction(
          user.uid,
          value,
        );
      } else {
        await addTransaction(
          user.uid,
          value,
        );
      }

      activity(
        value.type === "payment"
          ? "Payment received"
          : exists
            ? "Transaction updated"
            : "Transaction created",
        money(
          Number(value.amount || 0),
          data.business?.currency || "₹",
        ),
      );

      notify(
        exists
          ? "Transaction updated"
          : "Transaction saved",
      );

      return true;
    } catch (error) {
      console.error(
        "Transaction save error:",
        error,
      );

      notify(
        "Failed to save transaction",
      );

      return false;
    }
  };

  /* DELETE CUSTOMER */
  const deleteCustomer = async (id) => {
    if (!user?.uid) {
      notify("Please login first");
      return false;
    }

    try {
      const item =
        (data.customers || []).find(
          (customer) =>
            customer.id === id,
        );

      await deleteCustomerFromFirestore(
        user.uid,
        id,
      );

      activity(
        "Customer deleted",
        item?.name || "",
      );

      notify(
        "Customer deleted",
      );

      return true;
    } catch (error) {
      console.error(
        "Customer delete error:",
        error,
      );

      notify(
        "Failed to delete customer",
      );

      return false;
    }
  };

  /* DELETE TRANSACTION */
  const deleteTxn = async (id) => {
    if (!user?.uid) {
      notify("Please login first");
      return false;
    }

    try {
      await deleteTransactionFromFirestore(
        user.uid,
        id,
      );

      activity(
        "Transaction deleted",
      );

      notify(
        "Transaction deleted",
      );

      return true;
    } catch (error) {
      console.error(
        "Transaction delete error:",
        error,
      );

      notify(
        "Failed to delete transaction",
      );

      return false;
    }
  };

  /* CREATE REMINDER */
  const reminder = async (
    customer,
    channel = "WhatsApp",
    message = "",
  ) => {
    if (!user?.uid) {
      notify("Please login first");
      return false;
    }

    if (!customer?.id) {
      notify(
        "Customer ID missing",
      );
      return false;
    }

    if (
      Number(
        customer.outstanding || 0,
      ) <= 0
    ) {
      notify(
        "No pending amount for this customer",
      );
      return false;
    }

    try {
      await createReminder(
        user.uid,
        customer,
        channel,
        message,
      );

      activity(
        "Reminder created",
        `${customer.name} via ${channel}`,
      );

      notify(
        `${channel} reminder queued`,
      );

      return true;
    } catch (error) {
      console.error(
        "Reminder error:",
        error,
      );

      notify(
        error?.message ||
          "Failed to create reminder",
      );

      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        data,
        customers,
        totals,

        reminders,

        range,
        setRange,

        toast,
        user,

        loadingCustomers,
        loadingTransactions,
        loadingReminders,

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
export const useApp = () =>
  useContext(AppContext);