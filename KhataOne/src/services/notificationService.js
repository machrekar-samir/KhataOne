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

const notificationsRef = (uid) =>
  collection(
    db,
    "users",
    uid,
    "notifications",
  );

export const addNotification = async (
  uid,
  value,
) => {
  if (!uid) {
    throw new Error("User ID missing");
  }

  return addDoc(
    notificationsRef(uid),
    {
      text: value?.text || "",
      type: value?.type || "activity",
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
};

export const subscribeToNotifications = (
  uid,
  callback,
) => {
  if (!uid) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    notificationsRef(uid),
    (snapshot) => {
      const items = snapshot.docs
        .filter(
          (item) => item.id !== "_system",
        )
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .sort((a, b) => {
          const getTime = (value) => {
            if (value?.toDate) {
              return value.toDate().getTime();
            }

            if (value?.seconds) {
              return value.seconds * 1000;
            }

            return (
              new Date(value || 0).getTime() || 0
            );
          };

          return (
            getTime(b.createdAt) -
            getTime(a.createdAt)
          );
        });

      callback(items);
    },
    (error) => {
      console.error(
        "Notification realtime error:",
        error,
      );

      callback([]);
    },
  );
};

export const markNotificationRead = async (
  uid,
  id,
) => {
  if (!uid || !id) return;

  await updateDoc(
    doc(
      db,
      "users",
      uid,
      "notifications",
      id,
    ),
    {
      read: true,
      updatedAt: serverTimestamp(),
    },
  );
};

export const markAllNotificationsRead =
  async (uid) => {
    if (!uid) return;

    const { getDocs } = await import(
      "firebase/firestore"
    );

    const snapshot = await getDocs(
      notificationsRef(uid),
    );

    await Promise.all(
      snapshot.docs
        .filter(
          (item) => item.id !== "_system",
        )
        .filter(
          (item) =>
            item.data()?.read !== true,
        )
        .map((item) =>
          updateDoc(item.ref, {
            read: true,
            updatedAt:
              serverTimestamp(),
          }),
        ),
    );
  };

export const deleteNotification = async (
  uid,
  id,
) => {
  if (!uid || !id) return;

  await deleteDoc(
    doc(
      db,
      "users",
      uid,
      "notifications",
      id,
    ),
  );
};