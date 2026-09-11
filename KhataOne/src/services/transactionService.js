import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const getTransactionCollection = (userId) =>
  collection(
    db,
    "users",
    userId,
    "transactions",
  );

export const subscribeToTransactions = (
  userId,
  callback,
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const q = query(
    getTransactionCollection(userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs
        .filter(
          (document) =>
            document.id !== "_system",
        )
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }));

      callback(transactions);
    },
    (error) => {
      console.error(
        "Transaction subscription error:",
        error,
      );

      callback([]);
    },
  );
};

export const addTransaction = async (
  userId,
  value,
) => {
  if (!userId) {
    throw new Error("User not logged in");
  }

  const transactionData = {
    ...(value || {}),
  };

  delete transactionData.id;

  const docRef = await addDoc(
    getTransactionCollection(userId),
    {
      ...transactionData,
      amount: Number(
        transactionData.amount || 0,
      ),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
};

export const updateTransaction = async (
  userId,
  value,
) => {
  if (!userId || !value?.id) {
    throw new Error(
      "Transaction ID or User ID missing",
    );
  }

  const transactionRef = doc(
    db,
    "users",
    userId,
    "transactions",
    value.id,
  );

  const transactionData = {
    ...value,
  };

  delete transactionData.id;

  await updateDoc(
    transactionRef,
    {
      ...transactionData,
      amount: Number(
        transactionData.amount || 0,
      ),
      updatedAt: serverTimestamp(),
    },
  );
};

export const deleteTransaction = async (
  userId,
  transactionId,
) => {
  if (!userId || !transactionId) {
    throw new Error(
      "Transaction ID or User ID missing",
    );
  }

  const transactionRef = doc(
    db,
    "users",
    userId,
    "transactions",
    transactionId,
  );

  await deleteDoc(transactionRef);
};