import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

export async function getSettings(userId) {
  try {
    const ref = doc(db, "users", userId, "settings", "profile");
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return {
        ...defaultSettings,
        ...snapshot.data(),

        profile: {
          ...defaultSettings.profile,
          ...(snapshot.data().profile || {}),
        },

        business: {
          ...defaultSettings.business,
          ...(snapshot.data().business || {}),
        },

        preferences: {
          ...defaultSettings.preferences,
          ...(snapshot.data().preferences || {}),
        },

        notifications: {
          ...defaultSettings.notifications,
          ...(snapshot.data().notifications || {}),
        },
      };
    }

    await setDoc(ref, {
      ...defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return defaultSettings;
  } catch (error) {
    console.error("Get settings error:", error);
    throw error;
  }
}

export async function saveSettings(userId, settings) {
  try {
    const ref = doc(db, "users", userId, "settings", "profile");

    await setDoc(
      ref,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return true;
  } catch (error) {
    console.error("Save settings error:", error);
    throw error;
  }
}

export async function updateSettings(userId, updates) {
  try {
    const ref = doc(db, "users", userId, "settings", "profile");

    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Update settings error:", error);
    throw error;
  }
}

export { defaultSettings };