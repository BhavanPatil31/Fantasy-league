import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigFile from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_KEY_API_KEY || firebaseConfigFile.apiKey,
  authDomain: process.env.NEXT_PUBLIC_KEY_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: process.env.NEXT_PUBLIC_KEY_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: process.env.NEXT_PUBLIC_KEY_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_KEY_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_KEY_APP_ID || firebaseConfigFile.appId,
  firestoreDatabaseId: process.env.NEXT_PUBLIC_KEY_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
