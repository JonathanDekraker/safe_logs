// utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDkHRAl8bd7hgLA-9d2s-3unMNZIBPnm3I",
    authDomain: "safelogs-22a10.firebaseapp.com",
    databaseURL: "https://safelogs-22a10-default-rtdb.firebaseio.com",
    projectId: "safelogs-22a10",
    storageBucket: "safelogs-22a10.firebasestorage.app",
    messagingSenderId: "876702462587",
    appId: "1:876702462587:web:ac8bfdc08aafe1401228de",
    measurementId: "G-4R4VXV5440"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
