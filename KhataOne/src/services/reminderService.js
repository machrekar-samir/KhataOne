import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const remindersRef = (uid) =>
  collection(db, "users", uid, "reminders");

export const createReminder = async (
  uid,
  customer,
  channel = "WhatsApp",
  message = "",
) => {
  if (!uid) throw new Error("User ID missing");
  if (!customer?.id) {
    throw new Error("Customer ID missing");
  }

  const amount = Number(
    customer.outstanding || 0,
  );

  if (amount <= 0) {
    throw new Error("No pending amount");
  }

  return addDoc(remindersRef(uid), {
    customerId: customer.id,
    customerName: customer.name || "",
    phone: customer.phone || "",
    email: customer.email || "",
    amount,
    channel,
    message:
      message ||
      `Hi ${customer.name || "Customer"}, your pending amount is ₹${amount.toLocaleString(
        "en-IN",
      )}. Please make the payment at your convenience.`,
    status: "queued",
    scheduledAt: null,
    sentAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToReminders = (
  uid,
  callback,
) => {
  if (!uid) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    remindersRef(uid),
    (snapshot) => {
      const getTime = (value) => {
        if (value?.toDate) {
          return value.toDate().getTime();
        }

        if (value?.seconds) {
          return value.seconds * 1000;
        }

        const time = new Date(
          value || 0,
        ).getTime();

        return Number.isNaN(time)
          ? 0
          : time;
      };

      const items = snapshot.docs
        .filter(
          (item) => item.id !== "_system",
        )
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort(
          (a, b) =>
            getTime(b.createdAt) -
            getTime(a.createdAt),
        );

      callback(items);
    },
    (error) => {
      console.error(
        "Reminder realtime error:",
        error,
      );

      callback([]);
    },
  );
};

export const updateReminder = async (
  uid,
  id,
  changes,
) => {
  if (!uid || !id) {
    throw new Error("Invalid reminder");
  }

  return updateDoc(
    doc(
      db,
      "users",
      uid,
      "reminders",
      id,
    ),
    {
      ...changes,
      updatedAt:
        serverTimestamp(),
    },
  );
};

export const deleteReminder = async (
  uid,
  id,
) => {
  if (!uid || !id) {
    throw new Error("Invalid reminder");
  }

  return deleteDoc(
    doc(
      db,
      "users",
      uid,
      "reminders",
      id,
    ),
  );
};