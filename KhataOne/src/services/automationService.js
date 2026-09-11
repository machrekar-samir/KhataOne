import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const ref = (uid) =>
  collection(db, "users", uid, "automations");

const defaults = [
  {
    id: "due",
    title: "Payment due",
    detail: "When an invoice reaches its due date",
    action: "Send a friendly reminder",
    actionDetail: "Notify customer on the due date",
    status: "Active",
    tone: "green",
    icon: "calendar",
    actionIcon: "user",
  },
  {
    id: "overdue",
    title: "Payment overdue",
    detail: "Three days after the due date",
    action: "Send a professional reminder",
    actionDetail: "Notify customer 3 days after due date",
    status: "Active",
    tone: "amber",
    icon: "clock",
    actionIcon: "mail",
  },
  {
    id: "owner",
    title: "Owner alert",
    detail: "When a payment is more than 15 days late",
    action: "Notify owner",
    actionDetail: "Send an alert to business owner",
    status: "Paused",
    tone: "red",
    icon: "user",
    actionIcon: "bell",
  },
];

export const subscribeToAutomations = (
  uid,
  callback,
) => {
  if (!uid) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    ref(uid),
    (snapshot) => {
      callback(
        snapshot.docs
          .filter((item) => item.id !== "_system")
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) =>
            String(a.id).localeCompare(
              String(b.id),
            ),
          ),
      );
    },
    (error) => {
      console.error(
        "Automation subscription error:",
        error,
      );
      callback([]);
    },
  );
};

/* Create defaults only when automation collection is empty */
export const initializeAutomations = async (
  uid,
) => {
  if (!uid) return;

  const snapshot = await getDocs(ref(uid));

  const realDocs = snapshot.docs.filter(
    (item) => item.id !== "_system",
  );

  if (realDocs.length > 0) return;

  await Promise.all(
    defaults.map((item) =>
      setDoc(
        doc(
          db,
          "users",
          uid,
          "automations",
          item.id,
        ),
        {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      ),
    ),
  );
};

export const addAutomation = async (
  uid,
  value,
) => {
  if (!uid) {
    throw new Error("User not logged in");
  }

  const data = { ...(value || {}) };
  delete data.id;

  const result = await addDoc(ref(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return result.id;
};

export const updateAutomation = async (
  uid,
  id,
  changes,
) => {
  if (!uid || !id) {
    throw new Error("Automation ID missing");
  }

  await updateDoc(
    doc(
      db,
      "users",
      uid,
      "automations",
      id,
    ),
    {
      ...changes,
      updatedAt: serverTimestamp(),
    },
  );
};

export const deleteAutomation = async (
  uid,
  id,
) => {
  if (!uid || !id) {
    throw new Error("Automation ID missing");
  }

  await deleteDoc(
    doc(
      db,
      "users",
      uid,
      "automations",
      id,
    ),
  );
};