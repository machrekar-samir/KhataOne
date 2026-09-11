import {
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

import { initializeWorkspace } from "../services/workspaceService.js";
import { auth } from "../config/firebase.js";
import { AppContext } from "./appContext.js";

export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace);
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);

  const [loadedCustomersUid, setLoadedCustomersUid] =
    useState(null);

  const [loadedTransactionsUid, setLoadedTransactionsUid] =
    useState(null);

  const [loadedRemindersUid, setLoadedRemindersUid] =
    useState(null);

  /* AUTH + WORKSPACE */
  useEffect(() => {
    return onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (!currentUser?.uid) {
          setData((current) => ({
            ...current,
            customers: [],
            transactions: [],
          }));

          setReminders([]);

          setLoadedCustomersUid(null);
          setLoadedTransactionsUid(null);
          setLoadedRemindersUid(null);

          return;
        }

        try {
          await initializeWorkspace(
            currentUser.uid,
          );
        } catch (error) {
          console.error(
            "Workspace initialization error:",
            error,
          );
        }
      },
    );
  }, []);

  /* CUSTOMERS REALTIME */
  useEffect(() => {
    if (!user?.uid) return;

    setLoadedCustomersUid(null);

    return subscribeToCustomers(
      user.uid,
      (firebaseCustomers) => {
        setData((current) => ({
          ...current,
          customers: firebaseCustomers,
        }));

        setLoadedCustomersUid(user.uid);
      },
    );
  }, [user?.uid]);

  /* TRANSACTIONS REALTIME */
  useEffect(() => {
    if (!user?.uid) return;

    setLoadedTransactionsUid(null);

    return subscribeToTransactions(
      user.uid,
      (firebaseTransactions) => {
        setData((current) => ({
          ...current,
          transactions: firebaseTransactions,
        }));

        setLoadedTransactionsUid(user.uid);
      },
    );
  }, [user?.uid]);

  /* REMINDERS REALTIME */
  useEffect(() => {
    if (!user?.uid) return;

    setLoadedRemindersUid(null);

    return subscribeToReminders(
      user.uid,
      (firebaseReminders) => {
        setReminders(firebaseReminders);
        setLoadedRemindersUid(user.uid);
      },
    );
  }, [user?.uid]);

  /* LOCAL BACKUP */
  useEffect(() => {
    saveWorkspace(data);
  }, [data]);

  const visibleData = useMemo(
    () =>
      user
        ? data
        : {
            ...data,
            customers: [],
            transactions: [],
          },
    [data, user],
  );

  const visibleReminders = user
    ? reminders
    : [];

  /* CUSTOMER STATS */
  const customers = useMemo(
    () =>
      (visibleData.customers || []).map(
        (item) =>
          customerStats(
            item,
            visibleData.transactions || [],
          ),
      ),
    [visibleData],
  );

  /* TOTALS */
  const totals = useMemo(
    () =>
      metrics(
        visibleData.transactions || [],
        range,
      ),
    [visibleData, range],
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
      const exists = Boolean(value?.id);

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
        value?.name || "",
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

      notify("Failed to save customer");
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
      const exists = Boolean(value?.id);

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
        value?.type === "payment"
          ? "Payment received"
          : exists
            ? "Transaction updated"
            : "Transaction created",
        money(
          Number(value?.amount || 0),
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

      notify("Customer deleted");

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

      notify("Transaction deleted");

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
      notify("Customer ID missing");
      return false;
    }

    if (
      Number(customer.outstanding || 0) <= 0
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
        data: visibleData,
        customers,
        totals,

        reminders: visibleReminders,

        range,
        setRange,

        toast,
        user,

        loadingCustomers:
          Boolean(user?.uid) &&
          loadedCustomersUid !== user.uid,

        loadingTransactions:
          Boolean(user?.uid) &&
          loadedTransactionsUid !== user.uid,

        loadingReminders:
          Boolean(user?.uid) &&
          loadedRemindersUid !== user.uid,

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