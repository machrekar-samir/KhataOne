import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1sJqepDxJ72B9s57sY1_9ORN-IZJrc-g",
  authDomain: "khataone-a7d31.firebaseapp.com",
  projectId: "khataone-a7d31",
  storageBucket: "khataone-a7d31.firebasestorage.app",
  messagingSenderId: "1012378835989",
  appId: "1:1012378835989:web:0a17fcd5077230b07d021c",
  measurementId: "G-TSG3LJPHM6"
};
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;