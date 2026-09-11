import { useEffect, useMemo, useState } from "react";
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

import {
  addNotification,
  subscribeToNotifications,
} from "../services/notificationService.js";

import {
  getSettings,
  saveSettings,
} from "../services/settingsService.js";

import { initializeWorkspace } from "../services/workspaceService.js";
import { auth } from "../config/firebase.js";
import { AppContext } from "./appContext.js";

export function AppProvider({ children }) {
  const [data, setData] = useState(loadWorkspace);
  const [range, setRange] = useState("month");
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);

  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadedCustomersUid, setLoadedCustomersUid] =
    useState(null);

  const [loadedTransactionsUid, setLoadedTransactionsUid] =
    useState(null);

  const [loadedRemindersUid, setLoadedRemindersUid] =
    useState(null);

  const [settingsLoadedUid, setSettingsLoadedUid] =
    useState(null);

  /* ================= AUTH + WORKSPACE ================= */

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
            notifications: [],
            business: {},
            profile: {},
            preferences: {},
          }));

          setReminders([]);
          setNotifications([]);

          setLoadedCustomersUid(null);
          setLoadedTransactionsUid(null);
          setLoadedRemindersUid(null);
          setSettingsLoadedUid(null);

          return;
        }

        const uid = currentUser.uid;

        try {
          await initializeWorkspace(uid);

          const settings = await getSettings(uid);

          setData((current) => ({
            ...current,
            ...settings,
          }));

          setSettingsLoadedUid(uid);
        } catch (error) {
          console.error(
            "Workspace/settings error:",
            error,
          );
        }
      },
    );
  }, []);

  /* ================= CUSTOMERS REALTIME ================= */

  useEffect(() => {
    if (!user?.uid) return;

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

  /* ================= TRANSACTIONS REALTIME ================= */

  useEffect(() => {
    if (!user?.uid) return;

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

  /* ================= REMINDERS REALTIME ================= */

  useEffect(() => {
    if (!user?.uid) return;

    return subscribeToReminders(
      user.uid,
      (firebaseReminders) => {
        setReminders(firebaseReminders);
        setLoadedRemindersUid(user.uid);
      },
    );
  }, [user?.uid]);

  /* ================= NOTIFICATIONS REALTIME ================= */

  useEffect(() => {
    if (!user?.uid) return;

    return subscribeToNotifications(
      user.uid,
      (firebaseNotifications) => {
        setNotifications(firebaseNotifications);
      },
    );
  }, [user?.uid]);

  /* ================= LOCAL BACKUP ================= */

  useEffect(() => {
    saveWorkspace(data);
  }, [data]);

  /* ================= VISIBLE DATA ================= */

  const visibleData = useMemo(
    () =>
      user
        ? {
            ...data,
            notifications,
          }
        : {
            ...data,
            customers: [],
            transactions: [],
            notifications: [],
          },
    [data, user, notifications],
  );

  const visibleNotifications = user
    ? notifications
    : [];

  const visibleReminders = user
    ? reminders
    : [];

  /* ================= CUSTOMER STATS ================= */

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

  /* ================= TOTALS ================= */

  const totals = useMemo(
    () =>
      metrics(
        visibleData.transactions || [],
        range,
      ),
    [visibleData, range],
  );

  /* ================= CURRENCY ================= */

  const currency =
    data?.preferences?.currency ||
    "INR (₹)";

  /* ================= UPDATE ================= */

  const update = async (changes) => {
    setData((current) => ({
      ...current,
      ...changes,
    }));

    const isSettingsUpdate =
      "business" in changes ||
      "profile" in changes ||
      "preferences" in changes ||
      "notifications" in changes;

    if (!user?.uid || !isSettingsUpdate) {
      return true;
    }

    try {
      await saveSettings(
        user.uid,
        changes,
      );

      return true;
    } catch (error) {
      console.error(
        "Settings save error:",
        error,
      );

      notify(
        error?.message ||
          "Failed to save settings",
      );

      return false;
    }
  };

  /* ================= TOAST ================= */

  const notify = (message) => {
    setToast(message);

    window.setTimeout(
      () => setToast(""),
      2400,
    );
  };

  /* ================= ACTIVITY + NOTIFICATION ================= */

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

    if (user?.uid) {
      addNotification(user.uid, {
        text: detail
          ? `${title} — ${detail}`
          : title,
        type: "activity",
      }).catch((error) => {
        console.error(
          "Notification create error:",
          error,
        );
      });
    }
  };

  /* ================= SAVE CUSTOMER ================= */

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

      notify(
        "Failed to save customer",
      );

      return false;
    }
  };

  /* ================= SAVE TRANSACTION ================= */

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

      const isPayment =
        String(
          value?.type || "",
        ).toLowerCase() === "payment";

      activity(
        isPayment
          ? "Payment received"
          : exists
            ? "Transaction updated"
            : "Transaction created",
        money(
          Number(
            value?.amount || 0,
          ),
          currency,
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

      notify("Failed to save transaction");
      return false;
    }
  };

  /* ================= DELETE CUSTOMER ================= */

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

  /* ================= DELETE TRANSACTION ================= */

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

  /* ================= CREATE REMINDER ================= */

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
        data: visibleData,

        customers,
        totals,

        currency,

        reminders: visibleReminders,
        notifications: visibleNotifications,

        range,
        setRange,

        toast,
        user,

        loadingCustomers:
          Boolean(user?.uid) &&
          loadedCustomersUid !==
            user.uid,

        loadingTransactions:
          Boolean(user?.uid) &&
          loadedTransactionsUid !==
            user.uid,

        loadingReminders:
          Boolean(user?.uid) &&
          loadedRemindersUid !==
            user.uid,

        loadingSettings:
          Boolean(user?.uid) &&
          settingsLoadedUid !==
            user.uid,

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