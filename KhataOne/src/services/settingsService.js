import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const defaultSettings = {
  profile: {
    name: "",
    email: "",
    photoURL: "",
    role: "Owner",
  },

  business: {
    name: "",
    type: "Retail Shop",
    phone: "",
    address: "",
    logo: "",
  },

  preferences: {
    language: "English",
    dateFormat: "DD/MM/YYYY",
    currency: "INR (₹)",
    darkMode: false,
    compactView: false,
    playSounds: true,
  },

  notifications: {
    paymentReminders: true,
    collectionAlerts: true,
    newCustomer: true,
    systemUpdates: false,
  },
};

const settingsRef = (uid) =>
  doc(db, "users", uid, "settings", "business");

export async function getSettings(uid) {
  if (!uid) return defaultSettings;

  const ref = settingsRef(uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return defaultSettings;
  }

  const data = snapshot.data();

  return {
    ...defaultSettings,
    ...data,
    profile: {
      ...defaultSettings.profile,
      ...(data.profile || {}),
    },
    business: {
      ...defaultSettings.business,
      ...(data.business || {}),
    },
    preferences: {
      ...defaultSettings.preferences,
      ...(data.preferences || {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(data.notifications || {}),
    },
  };
}

export async function saveSettings(
  uid,
  settings,
) {
  if (!uid) {
    throw new Error("User ID missing");
  }

  await setDoc(
    settingsRef(uid),
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return true;
}

export { defaultSettings };