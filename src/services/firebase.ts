import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let firebaseApp: FirebaseApp | null = null;
let db: Database | null = null;
let storage: FirebaseStorage | null = null;
let initPromise: Promise<void> | null = null;

export const initFirebase = (): Promise<void> => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    if (!config.apiKey) {
      console.warn(
        'Firebase config not found. Add VITE_FIREBASE_* variables to .env.local\n' +
        'Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_DATABASE_URL, ' +
        'VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_APP_ID'
      );
      return;
    }

    try {
      firebaseApp = initializeApp(config);
      db = getDatabase(firebaseApp);
      storage = getStorage(firebaseApp);
      console.log('Firebase initialized successfully');
    } catch (err) {
      console.error('Firebase init failed:', err);
    }
  })();

  return initPromise;
};

export const ensureFirebase = async (): Promise<boolean> => {
  if (firebaseApp) return true;
  if (initPromise) await initPromise;
  return firebaseApp !== null;
};

export const getDb = () => db;
export const getStorageRef = () => storage;
export const isFirebaseAvailable = () => firebaseApp !== null;
