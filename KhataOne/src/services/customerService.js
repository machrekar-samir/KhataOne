import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const getCustomerCollection = (userId) =>
  collection(db, "users", userId, "customers");

export const subscribeToCustomers = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    getCustomerCollection(userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const customers = snapshot.docs
        .filter((item) => item.id !== "_system")
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }));

      callback(customers);
    },
    (error) => {
      console.error(
        "Customer subscription error:",
        error,
      );
      callback([]);
    },
  );
};

export const addCustomer = async (userId, value) => {
  if (!userId) {
    throw new Error("User not logged in");
  }

  const data = { ...(value || {}) };
  delete data.id;

  const docRef = await addDoc(
    getCustomerCollection(userId),
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
};

export const updateCustomer = async (
  userId,
  value,
) => {
  if (!userId || !value?.id) {
    throw new Error(
      "Customer ID or User ID missing",
    );
  }

  const customerRef = doc(
    db,
    "users",
    userId,
    "customers",
    value.id,
  );

  const data = { ...value };
  delete data.id;

  await setDoc(
    customerRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const deleteCustomer = async (
  userId,
  customerId,
) => {
  if (!userId || !customerId) {
    throw new Error(
      "Customer ID or User ID missing",
    );
  }

  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "customers",
      customerId,
    ),
  );
};

export const removeCustomer = deleteCustomer;