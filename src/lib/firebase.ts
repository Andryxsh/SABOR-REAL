import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyC9olpAu17pc1p43TOURH8jBWl4zP6CFhc",
    authDomain: "sabor-real-bfc68.firebaseapp.com",
    projectId: "sabor-real-bfc68",
    storageBucket: "sabor-real-bfc68.firebasestorage.app",
    messagingSenderId: "249559316320",
    appId: "1:249559316320:web:23478677e6029085291005"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence not supported by browser');
        }
    });
