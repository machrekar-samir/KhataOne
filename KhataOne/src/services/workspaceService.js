import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase.js";

const collections = [
  "customers",
  "transactions",
  "reminders",
  "notifications",
  "automations",
];

export const initializeWorkspace = async (uid) => {
  if (!uid) return;

  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await Promise.all(
    collections.map((name) =>
      setDoc(
        doc(db, "users", uid, name, "_system"),
        {
          system: true,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );

  await setDoc(
    doc(db, "users", uid, "settings", "business"),
    {
      initialized: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};