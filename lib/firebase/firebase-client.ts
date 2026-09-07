'use client';

// Miftah Tools Official Production Firebase Client SDK Initialization
// Dedicated Project: studio-3108342384-2960a (Miftah Tools Pro)

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyAZfVYKYHzIRz9QTZboE04hat5fEZ6nwVI",
  authDomain: "studio-3108342384-2960a.firebaseapp.com",
  databaseURL: "https://studio-3108342384-2960a-default-rtdb.firebaseio.com",
  projectId: "studio-3108342384-2960a",
  storageBucket: "studio-3108342384-2960a.firebasestorage.app",
  messagingSenderId: "701477341899",
  appId: "1:701477341899:web:84030b9d2b3da73531294e"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let rtdb: Database;

if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  rtdb = getDatabase(app);
} else {
  // Safe mock handles during static build / SSR phase
  app = (!getApps().length ? initializeApp(firebaseConfig) : getApp()) as FirebaseApp;
}

export { app, auth, db, storage, rtdb };
